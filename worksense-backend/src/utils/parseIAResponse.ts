import { Priority } from "../../types/backlog.js";
export interface ParsedEpicSuggestion {
  name: string;
  description: string | null;
  priority: Priority;
}

const ALLOWED: Priority[] = ["lowest", "low", "medium", "high", "highest"];
const norm = (p: any): Priority => (ALLOWED.includes(p) ? p : "medium");

export function parseIAResponse(raw: string): ParsedEpicSuggestion[] {
  let str = raw.trim();
  if (str.startsWith("```")) str = str.replace(/^```.*?\n|```$/g, "").trim();

  const { epics } = JSON.parse(str);
  return epics.map((e: any) => ({
    name: String(e.name || "").trim(),
    description: e.description?.trim() || null,
    priority: norm(String(e.priority || "medium").toLowerCase()),
  }));
}
