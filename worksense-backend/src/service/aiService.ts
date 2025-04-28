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
