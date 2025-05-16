import { Request, Response } from "express";

export const callGemini = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
    return;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response from Gemini";

    res.status(200).json({ reply }); // 👈 sin return
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to call Gemini API" }); // 👈 sin return
  }
};

