import { BacklogItemData } from "../../types/backlog.js";

export interface ParsedEpicSuggestion {
  name: string;
  description: string | null;
  priority: "high" | "medium" | "low";
}

export interface ParsedStorySuggestion {
  name: string;
  description: string | null;
  priority: "high" | "medium" | "low";
}

const ALLOWED: BacklogItemData["priority"][] = ["low", "medium", "high"];
const norm = (p: any): BacklogItemData["priority"] =>
  ALLOWED.includes(p) ? p : "medium";

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

export function parseStoriesResponse(raw: string): ParsedStorySuggestion[] {
  let str = raw.trim();
  if (str.startsWith("```")) str = str.replace(/^```.*?\n|```$/g, "").trim();

  const { stories } = JSON.parse(str);
  return stories.map((s: any) => ({
    name: String(s.name || "").trim(),
    description: s.description?.trim() || null,
    priority: norm(String(s.priority || "medium").toLowerCase()),
  }));
}