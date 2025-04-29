// src/components/BacklogTable/types.ts
import { ReactNode } from "react";

export interface Story {
  id: string;
  title: string;
  status: string;
  assignee: string;
  size: "S" | "M" | "L";
  priority?: string;
  dueDate?: string;
  points?: number;
  epic?: string;
  labels?: string[];
}

export interface Epic {
  id: string;
  title: string;
  stories: Story[];
}

export interface Item extends Story {}

export interface BacklogData {
  epics: Epic[];
  userStories: Story[];
  bugs: Item[];
}

export interface ColumnDefinition {
  id: string;
  label: string;
  field: keyof Story;
  width: string;
  render: (item: Story | Item) => ReactNode;
}