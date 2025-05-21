// models/conversation.ts
import { Timestamp } from "firebase-admin/firestore";

export interface Conversation {
  id?: string;
  projectId: string;
  userId: number;
  messages: ConversationMessage[];
  metadata: ConversationMetadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Timestamp;
}

export interface ConversationMetadata {
  userPreferences?: {
    nickname?: string;
    notificationPreferences?: string;
    preferredLanguage?: string;
  };
  context?: {
    recentTopics?: string[];
    lastDiscussedItems?: string[];
    knownFacts?: Record<string, any>;
  };
  assistantSettings?: {
    verbosityLevel?: "concise" | "normal" | "detailed";
    focusArea?: string;
  };
}