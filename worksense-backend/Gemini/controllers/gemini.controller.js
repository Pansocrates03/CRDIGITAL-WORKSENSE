import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export const getGeminiResponse = async (req, res) => {
  console.log("📌 getGeminiResponse was called"); // Check if the function is executed

  const apiKey = process.env.API_KEY_GEMINI;
  if (!apiKey) {
    console.error("❌ API Key not configured");
    return res
      .status(500)
      .json({ error: "API Key not configured in the environment" });
  }

  console.log("✅ API Key loaded successfully");

  const prompt =
    "You are Worksense, an assistant specialized in web development. Greet the team in a friendly and professional manner. Mention that you are here to help them with their project using Node.js/Express on the backend, React on the frontend, Firebase for text storage, a relational database, and AI calls. Offer your assistance in solving technical doubts, providing code examples, and suggesting solutions to common problems. Finish by asking how you can help them today.";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

  try {
    console.log("📡 Sending request to Gemini...");
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    console.log("📩 Receiving response from Gemini...");
    const data = await response.json();

    console.log("✅ Response from Gemini:", data);
    res.json(data);
  } catch (error) {
    console.error("❌ Error getting response from Gemini:", error);
    res.status(500).json({ error: "Error getting response from Gemini" });
  }
};
