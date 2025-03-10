import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export const getGeminiResponse = async (req, res) => {
    console.log("📌 getGeminiResponse fue llamado"); // Ver si la función se ejecuta

    const apiKey = process.env.API_KEY_GEMINI;
    if (!apiKey) {
        console.error("❌ API Key no configurada");
        return res.status(500).json({ error: "API Key no configurada en el entorno" });
    }

    console.log("✅ API Key cargada correctamente");

    const prompt = "Write a short HAIKU";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

    try {
        console.log("📡 Enviando solicitud a Gemini...");
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        console.log("📩 Recibiendo respuesta de Gemini...");
        const data = await response.json();

        console.log("✅ Respuesta de Gemini:", data);
        res.json(data);
    } catch (error) {
        console.error("❌ Error al obtener respuesta de Gemini:", error);
        res.status(500).json({ error: "Error al obtener respuesta de Gemini" });
    }
};

