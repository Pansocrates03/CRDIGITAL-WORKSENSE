import axios, { AxiosError } from "axios";

interface FridaSuccess {
  success: true;
  data: string;
}
interface FridaFailure {
  success: false;
  message: string;
}
type FridaResponse = FridaSuccess | FridaFailure;

const FRIDA_URL = process.env.FRIDA_API_URL;
if (!FRIDA_URL) throw new Error("FRIDA_API_URL env var missing");

/**
 * Genera epics a partir de prompt
 */
export async function generateEpicsWithFrida({
  projectName,
  projectDescription,
}: {
  projectName: string;
  projectDescription: string;
}): Promise<string> {
  const prompt = `You are Frida, an AI assistant specialized in Scrum project planning. Generate 3–5 epics for the project \"{projectName}\" described as \"{projectDescription}\". Each epic must include name, description and priority (lowest|low|medium|high|highest). Respond only with JSON under key \"epics\".`;

  try {
    const { data } = await axios.post<FridaResponse>(
      `${FRIDA_URL}/epics/generate-from-prompt/`,
      { prompt, data: { projectName, projectDescription } },
      { headers: { "Content-Type": "application/json" }, timeout: 30000 }
    );

    if (data.success && typeof data.data === "string" && data.data.trim()) {
      return data.data;
    }
    throw new Error(
      `Frida error: ${(data as FridaFailure).message || "unknown"}`
    );
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const e = err as AxiosError;
      throw new Error(
        `Frida request failed${e.response ? ` – ${e.response.status}` : ""}: ${
          e.message
        }`
      );
    }
    throw err;
  }
}

/**
 * Genera historias de usuario a partir de epics
 */
export async function generateStoriesWithFrida({
  projectName,
  projectDescription,
  epicName,
  epicDescription,
}: {
  projectName: string;
  projectDescription: string;
  epicName: string;
  epicDescription: string;
}): Promise<string> {
  const prompt = `You are Frida, an AI assistant specialized in Scrum project planning. Based on the epic "${epicName}" (description: "${epicDescription}") within the project "${projectName}" (overview: "${projectDescription}"), generate 3–5 user stories.

Each user story should:

Follow the format "As a [user], I want [feature] so that [benefit]."

Include the following fields:

name (a concise title)
description (the user story in the specified format)
priority ("low", "medium", or "high")
acceptanceCriteria (an array of 3-5 specific acceptance criteria)
size ("XS", "S", "M", "L", or "XL" based on the story's complexity)

Return your output as a JSON object under the key "stories" only. Do not include explanations or commentary.`;

  console.log("Debug - Frida Story Generation:");
  console.log("Input Data:", {
    projectName,
    projectDescription,
    epicName,
    epicDescription,
  });
  console.log("Generated Prompt:", prompt);

  try {
    const { data } = await axios.post<FridaResponse>(
      `${FRIDA_URL}/epics/generate-from-prompt`,
      {
        prompt,
        data: { projectName, projectDescription, epicName, epicDescription },
      },
      { headers: { "Content-Type": "application/json" }, timeout: 30000 }
    );

    if (data.success && typeof data.data === "string" && data.data.trim()) {
      return data.data;
    }
    throw new Error(
      `Frida error: ${(data as FridaFailure).message || "unknown"}`
    );
  } catch (err) {
    console.error("Frida Error Details:", {
      error: err,
      status: axios.isAxiosError(err) ? err.response?.status : "N/A",
      data: axios.isAxiosError(err) ? err.response?.data : "N/A",
    });
    if (axios.isAxiosError(err)) {
      const e = err as AxiosError;
      throw new Error(
        `Frida request failed${e.response ? ` – ${e.response.status}` : ""}: ${
          e.message
        }`
      );
    }
    throw err;
  }
}
