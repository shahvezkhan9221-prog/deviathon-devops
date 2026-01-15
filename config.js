// config.js
// APNI GEMINI API KEY YAHA PASTE KARO
const API_KEY = "AIzaSyA_tptCHQOo_qjepsOVk5_D1j9Beh10kWQ";

// Is function ka use hum har jagah karenge API call ke liye
async function callGeminiAPI(prompt, isJson = false) {
    // Check for missing or placeholder API key
    if (!API_KEY || API_KEY === "AIzaSyDVQoDLepMISY4V2-wE0UyXDn58Vi5YvL4") {
        const errorMsg = "API Key not configured in config.js";
        return isJson ? JSON.stringify({ error: errorMsg }) : errorMsg;
    }

    // FIXED: Updated model to gemini-2.5-flash (Stable 2026 version)
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    try {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: isJson ? { responseMimeType: "application/json" } : {}
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || `HTTP Error ${response.status}`);
        }

        const data = await response.json();
        
        // Safety check to ensure the AI returned content
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Invalid response format from Gemini API");
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        const finalError = `AI Error: ${error.message}`;
        return isJson ? JSON.stringify({ error: finalError }) : finalError;
    }
}
