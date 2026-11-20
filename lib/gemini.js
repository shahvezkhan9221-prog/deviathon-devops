const MODEL = "google/gemini-4-hydrogen";
const MAX_TEXT_CHARS = 24_000;
const MAX_MEDIA_BYTES = 2_000_000;
const ALLOWED_MEDIA_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
]);

function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeParts(input) {
    const parts = typeof input === "string" ? [{ text: input }] : input;

    if (!Array.isArray(parts) || parts.length === 0 || parts.length > 8) {
        throw createError("Provide a prompt with between one and eight content parts.", 400);
    }

    let totalBytes = 0;
    const normalized = parts.map((part) => {
        if (!part || typeof part !== "object" || Array.isArray(part)) {
            throw createError("The prompt contains an invalid content part.", 400);
        }

        if (typeof part.text === "string" && part.inlineData === undefined) {
            if (!part.text.trim() || part.text.length > MAX_TEXT_CHARS) {
                throw createError(`Text content must be between 1 and ${MAX_TEXT_CHARS} characters.`, 400);
            }
            totalBytes += Buffer.byteLength(part.text, "utf8");
            return { type: "text", text: part.text };
        }

        const media = part.inlineData;
        if (
            media &&
            typeof media === "object" &&
            ALLOWED_MEDIA_TYPES.has(media.mimeType) &&
            typeof media.data === "string" &&
            /^[A-Za-z0-9+/]+={0,2}$/.test(media.data)
        ) {
            const mediaBytes = Buffer.byteLength(media.data, "base64");
            if (mediaBytes > MAX_MEDIA_BYTES) {
                throw createError("Uploaded media must be 2 MB or smaller.", 413);
            }
            totalBytes += mediaBytes;
            return {
                type: "file",
                mediaType: media.mimeType === "application/pdf" ? "application/pdf" : "image",
                data: Buffer.from(media.data, "base64"),
            };
        }

        throw createError("The prompt contains unsupported content.", 400);
    });

    if (totalBytes > MAX_MEDIA_BYTES + MAX_TEXT_CHARS * 4) {
        throw createError("The request is too large.", 413);
    }

    return normalized;
}

async function generateGeminiContent(input, isJson = false) {
    const content = normalizeParts(input);

    try {
        const { generateText, Output } = await import("ai");
        const result = await generateText({
            model: MODEL,
            messages: [{ role: "user", content }],
            maxOutputTokens: 2048,
            ...(isJson ? { output: Output.json() } : {}),
        });

        if (isJson) {
            if (result.output === undefined) {
                throw createError("The AI response did not contain valid JSON.", 502);
            }
            return { text: JSON.stringify(result.output), json: result.output };
        }

        if (!result.text?.trim()) {
            throw createError("The AI returned no text. Please try again.", 502);
        }

        return { text: result.text };
    } catch (error) {
        if (Number.isInteger(error.statusCode)) throw error;
        if (error.name === "TimeoutError" || error.name === "AbortError") {
            throw createError("The AI took too long to respond. Please try again.", 504);
        }
        console.error("[ai] Gateway request failed:", error.name || "Error");
        throw createError(
            error.name === "AI_NoObjectGeneratedError"
                ? "The AI response could not be parsed as JSON. Please try again."
                : "AI Gateway could not complete the request. Check its Vercel connection and try again.",
            502,
        );
    }
}

module.exports = { generateGeminiContent };
