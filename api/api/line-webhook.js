import crypto from "node:crypto";

export const config = {
    api: {
        bodyParser: false
    }
};

function readRawBody(request) {
    return new Promise((resolve, reject) => {
        const chunks = [];

        request.on("data", chunk => {
            chunks.push(chunk);
        });

        request.on("end", () => {
            resolve(Buffer.concat(chunks));
        });

        request.on("error", reject);
    });
}

function verifyLineSignature(
    rawBody,
    receivedSignature,
    channelSecret
) {
    if (
        !receivedSignature ||
        !channelSecret
    ) {
        return false;
    }

    const expectedSignature = crypto
        .createHmac("sha256", channelSecret)
        .update(rawBody)
        .digest("base64");

    const receivedBuffer =
        Buffer.from(receivedSignature);

    const expectedBuffer =
        Buffer.from(expectedSignature);

    if (
        receivedBuffer.length !==
        expectedBuffer.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
    );
}

export default async function handler(request, response) {
    if (request.method !== "POST") {
        response.setHeader("Allow", "POST");

        return response.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    try {
        const rawBody = await readRawBody(request);

        const signature = String(
            request.headers["x-line-signature"] || ""
        );

        const channelSecret =
            process.env.LINE_CHANNEL_SECRET;

        const gasWebAppUrl =
            process.env.GAS_WEB_APP_URL;

        const sharedSecret =
            process.env.WEBHOOK_SHARED_SECRET;

        if (
            !channelSecret ||
            !gasWebAppUrl ||
            !sharedSecret
        ) {
            throw new Error(
                "Vercel Environment Variables ไม่ครบ"
            );
        }

        const isValid = verifyLineSignature(
            rawBody,
            signature,
            channelSecret
        );

        if (!isValid) {
            return response.status(401).json({
                success: false,
                message: "Invalid LINE signature"
            });
        }

        const lineBody = JSON.parse(
            rawBody.toString("utf8") || "{}"
        );

        const gasResponse = await fetch(
            gasWebAppUrl,
            {
                method: "POST",
                redirect: "follow",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    action: "lineWebhook",
                    sharedSecret,
                    lineBody
                })
            }
        );

        const gasText = await gasResponse.text();

        console.log(
            "Apps Script response:",
            gasText
        );

        /*
         * LINE ต้องได้รับ 200 โดยตรง
         */
        return response.status(200).json({
            success: true
        });

    } catch (error) {
        console.error("LINE webhook error:", error);

        return response.status(500).json({
            success: false,
            message: "Webhook processing failed"
        });
    }
}