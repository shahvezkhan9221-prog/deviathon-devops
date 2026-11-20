(function attachGeminiClient() {
    async function callGeminiAPI(input, isJson = false) {
        const parts = typeof input === "string" ? [{ text: input }] : input;
        const response = await fetch("/api/gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ parts, isJson }),
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.error || `Gemini request failed (${response.status}).`);
        }

        return result;
    }

    window.callGeminiAPI = callGeminiAPI;
})();
