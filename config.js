// config.js
const API_KEY = "AIzaSyDVQoDLepMISY4V2-wE0UyXDn58Vi5YvL4";

async function callGeminiAPI(prompt, isJson = false) {
    console.log("Attempting API Call with prompt:", prompt.substring(0, 50) + "...");

    if (!API_KEY || API_KEY.includes("AIzaSyDVQo")) {
        return isJson ? JSON.stringify({ error: "Missing API Key" }) : "Missing API Key";
    }

    // USE THIS EXACT VERSION: gemini-1.5-flash
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: isJson ? { responseMimeType: "application/json" } : {}
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Server Response Error:", data);
            throw new Error(data.error?.message || "Unknown API Error");
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Detailed Error Log:", error);
        return isJson ? JSON.stringify({ error: error.message }) : `Error: ${error.message}`;
    }
}
