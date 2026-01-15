// config.js
// APNI GEMINI API KEY YAHA PASTE KARO
const API_KEY = "AIzaSyA_tptCHQOo_qjepsOVk5_D1j9Beh10kWQ";

// Is function ka use hum har jagah karenge API call ke liye
async function callGeminiAPI(prompt, isJson = false) {
    // Check if the API key is missing or is still the placeholder value
    if (!API_KEY || API_KEY === "AIzaSyDVQoDLepMISY4V2-wE0UyXDn58Vi5YvL4") {
        const errorMsg = "API Key not configured in config.js";
        return isJson ? JSON.stringify({ error: errorMsg }) : errorMsg;
    }

    // UPDATED: Using gemini-2.5-flash as the stable version for 2026
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
            // This will help identify if the error is due to an invalid key or restricted model
            throw new Error(errorData.error.message || "Unknown API Error");
        }

        const data = await response.json();
        
        // Safety check for response structure
        if (data.candidates && data.candidates[0].content.parts[0].text) {
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
