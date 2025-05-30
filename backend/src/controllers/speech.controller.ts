// controllers/speech.controller.ts
import { Request, Response } from "express";

// Get speech token for client-side SDK
export const getSpeechToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!key || !region) {
      console.error("Azure Speech configuration missing");
      res.status(500).json({ message: "Speech service configuration error" });
      return;
    }

    // Get auth token from Azure
    const tokenEndpoint = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
    
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get auth token');
    }

    const token = await tokenResponse.text();
    
    // Return token and region for client-side SDK
    res.json({
      token: token,
      region: region,
      language: "en-US"
    });

  } catch (error) {
    console.error("Error getting speech token:", error);
    res.status(500).json({ message: "Error initializing speech service" });
  }
};