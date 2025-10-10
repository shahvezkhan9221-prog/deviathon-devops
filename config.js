
// config.js
// APNI GEMINI API KEY YAHA PASTE KARO
const API_KEY =  "AIzaSyA_tptCHQOo_qjepsOVk5_D1j9Beh10kWQ";

// Is function ka use hum har jagah karenge API call ke liye
async function callGeminiAPI(prompt, isJson = false) {
    if (!API_KEY || API_KEY ===  "AIzaSyACnELuM-9jOQEsz3h9T_xpB-FDh2kdO18") {
        const errorMsg = "API Key not configured in config.js";
        return isJson ? JSON.stringify({ error: errorMsg }) : errorMsg;
    }
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
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
            throw new Error(errorData.error.message);
        }
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return isJson ? JSON.stringify({ error: `AI Error: ${error.message}` }) : `AI Error: ${error.message}`;
    }
}