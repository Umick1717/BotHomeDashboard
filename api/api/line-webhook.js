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
            chunks.push(
                Buffer.isBuffer(chunk)
                    ? chunk
                    : Buffer.from(chunk)
            );
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
    if (!receivedSignature || !channelSecret) {
        return false;
    }

    const expectedSignature = crypto
        .createHmac("sha256", channelSecret)
        .update(rawBody)
        .digest("base64");

    const receivedBuffer =
        Buffer.from(String(receivedSignature));

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

async function registerTargetWithAppsScript(
    targetId,
    sourceType
) {
    const gasWebAppUrl =
        process.env.GOOGLE_APPS_SCRIPT_URL;

    const sharedSecret =
        process.env.WEBHOOK_SHARED_SECRET;

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
                action: "registerLineTarget",
                sharedSecret,
                targetId,
                sourceType
            })
        }
    );

    const gasText = await gasResponse.text();

    console.log(
        "Apps Script response:",
        gasText
    );

    let gasResult;

    try {
        gasResult = JSON.parse(gasText);
    } catch {
        throw new Error(
            "Google Apps Script returned non-JSON"
        );
    }

    if (!gasResult.success) {
        throw new Error(
            gasResult.message ||
            "Google Apps Script rejected target registration"
        );
    }

    return gasResult;
}

export default async function handler(
    request,
    response
) {
    if (request.method === "GET") {
        return response.status(200).json({
            success: true,
            message: "LINE webhook is running"
        });
    }

    if (request.method !== "POST") {
        response.setHeader(
            "Allow",
            "GET, POST"
        );

        return response.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    try {
        const channelSecret =
            process.env.LINE_CHANNEL_SECRET;

        const gasWebAppUrl =
            process.env.GOOGLE_APPS_SCRIPT_URL;

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

        const rawBody =
            await readRawBody(request);

        const signature = String(
            request.headers[
                "x-line-signature"
            ] || ""
        );

        const isValid =
            verifyLineSignature(
                rawBody,
                signature,
                channelSecret
            );

        if (!isValid) {
            return response.status(401).json({
                success: false,
                message:
                    "Invalid LINE signature"
            });
        }

        const lineBody = JSON.parse(
            rawBody.toString("utf8") || "{}"
        );

        const events = Array.isArray(
            lineBody.events
        )
            ? lineBody.events
            : [];

        if (events.length === 0) {
            return response.status(200).json({
                success: true,
                message:
                    "Webhook verification accepted"
            });
        }

        const uniqueTargets = new Map();

        for (const event of events) {
            const source =
                event && event.source
                    ? event.source
                    : {};

            const targetId =
                source.groupId ||
                source.roomId ||
                source.userId ||
                "";

            if (!targetId) {
                continue;
            }

            uniqueTargets.set(
                targetId,
                {
                    targetId,
                    sourceType:
                        source.type ||
                        "unknown"
                }
            );
        }

        for (
            const target of
            uniqueTargets.values()
        ) {
            await registerTargetWithAppsScript(
                target.targetId,
                target.sourceType
            );
        }

        return response.status(200).json({
            success: true,
            receivedEvents:
                events.length,
            registeredTargets:
                uniqueTargets.size
        });

    } catch (error) {
        console.error(
            "LINE webhook error:",
            error
        );

        return response.status(200).json({
            success: false,
            message:
                error && error.message
                    ? error.message
                    : "Webhook processing failed"
        });
    }
}
