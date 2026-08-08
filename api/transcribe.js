export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb'
    }
  }
};

function extensionForMime(mime = '') {
  const value = String(mime).toLowerCase();
  if (value.includes('mp4') || value.includes('m4a')) return 'm4a';
  if (value.includes('wav')) return 'wav';
  if (value.includes('mpeg') || value.includes('mp3')) return 'mp3';
  if (value.includes('webm')) return 'webm';
  return 'webm';
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      service: 'game-audio-transcription',
      configured: Boolean(process.env.OPENAI_API_KEY)
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: 'STT_NOT_CONFIGURED',
      message: 'Vercel ยังไม่มี OPENAI_API_KEY สำหรับระบบถอดเสียง'
    });
  }

  try {
    const { audioBase64, mimeType = 'audio/webm', language = 'en' } = req.body || {};

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ error: 'ไม่พบข้อมูลเสียง' });
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    if (!audioBuffer.length) return res.status(400).json({ error: 'ไฟล์เสียงว่าง' });
    if (audioBuffer.length > 3_200_000) return res.status(413).json({ error: 'ไฟล์เสียงใหญ่เกินไป กรุณาพูดสั้นลง' });

    const form = new FormData();
    const ext = extensionForMime(mimeType);
    const blob = new Blob([audioBuffer], { type: mimeType || 'audio/webm' });
    form.append('file', blob, `answer.${ext}`);
    form.append('model', 'gpt-4o-mini-transcribe');
    form.append('language', language === 'th' ? 'th' : 'en');
    form.append('response_format', 'json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: form
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Transcription API error', response.status, data);
      return res.status(502).json({
        error: 'TRANSCRIPTION_FAILED',
        message: data?.error?.message || 'ถอดเสียงไม่สำเร็จ'
      });
    }

    return res.status(200).json({
      ok: true,
      text: String(data.text || '').trim()
    });
  } catch (error) {
    console.error('transcribe.js failed', error);
    return res.status(500).json({
      error: 'TRANSCRIPTION_SERVER_ERROR',
      message: error?.message || 'ระบบถอดเสียงขัดข้อง'
    });
  }
}
