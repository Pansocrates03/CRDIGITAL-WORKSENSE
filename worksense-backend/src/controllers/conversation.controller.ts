// controllers/conversation.controller.ts with English as default language
import { Request, Response, NextFunction } from "express";
import { db } from "../models/firebase.js";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import {
  Conversation,
  ConversationMessage,
  ConversationMetadata,
} from "../../types/conversation.js";

/**
 * Get or create a conversation for a user in a project
 */
export const getOrCreateConversation = async (
  userId: number,
  projectId: string
): Promise<Conversation> => {
  console.log(
    `🔍 Looking for conversation for user ${userId} in project ${projectId}`
  );

  try {
    // Look for existing conversation
    const conversationsRef = db.collection("conversations");

    // Using try/catch to handle potential missing index
    try {
      const querySnapshot = await conversationsRef
        .where("userId", "==", userId)
        .where("projectId", "==", projectId)
        .orderBy("updatedAt", "desc")
        .limit(1)
        .get();

      // If conversation exists, return it
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        console.log(`✅ Existing conversation found: ${doc.id}`);
        return {
          id: doc.id,
          ...doc.data(),
        } as Conversation;
      }
    } catch (indexError: any) {
      // If it's specifically an index error, try a simpler query
      if (
        indexError.message &&
        indexError.message.includes("FAILED_PRECONDITION")
      ) {
        console.log("⚠️ Firestore index error. Trying alternative query...");

        // Try simpler query without sorting
        const simpleQuerySnapshot = await conversationsRef
          .where("userId", "==", userId)
          .where("projectId", "==", projectId)
          .get();

        if (!simpleQuerySnapshot.empty) {
          // Find the most recently updated document manually
          let mostRecentDoc = simpleQuerySnapshot.docs[0];
          let mostRecentTime = mostRecentDoc.data().updatedAt?.toMillis() || 0;

          simpleQuerySnapshot.docs.forEach((doc) => {
            const updateTime = doc.data().updatedAt?.toMillis() || 0;
            if (updateTime > mostRecentTime) {
              mostRecentDoc = doc;
              mostRecentTime = updateTime;
            }
          });

          console.log(
            `✅ Existing conversation found (alternative query): ${mostRecentDoc.id}`
          );
          return {
            id: mostRecentDoc.id,
            ...mostRecentDoc.data(),
          } as Conversation;
        }
      } else {
        // If it's not an index error, rethrow
        throw indexError;
      }
    }

    // If we reach here, we need to create a new conversation
    console.log("🆕 Creating new conversation...");

    // Set default language to English ('en')
    const newConversation: Omit<Conversation, "id"> = {
      projectId,
      userId,
      messages: [],
      metadata: {
        userPreferences: {
          preferredLanguage: "en", // Default to English
        },
        context: {
          recentTopics: [],
          lastDiscussedItems: [],
          knownFacts: {},
        },
        assistantSettings: {
          verbosityLevel: "normal",
        },
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await conversationsRef.add(newConversation);
    console.log(`✅ New conversation created with ID: ${docRef.id}`);

    return {
      id: docRef.id,
      ...newConversation,
    };
  } catch (error) {
    console.error("❌ Error in getOrCreateConversation:", error);

    // Create a temporary conversation object with English as default
    return {
      id: `temp-${Date.now()}`,
      projectId,
      userId,
      messages: [],
      metadata: {
        userPreferences: {
          preferredLanguage: "en", // Default to English
        },
        context: {
          recentTopics: [],
          lastDiscussedItems: [],
          knownFacts: {},
        },
        assistantSettings: {
          verbosityLevel: "normal",
        },
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  }
};

/**
 * Add a message to conversation and update metadata if needed
 */
export const addMessageToConversation = async (
  conversationId: string,
  message: ConversationMessage,
  metadataUpdates?: Partial<ConversationMetadata>
): Promise<void> => {
  // Skip for temporary conversations
  if (conversationId.startsWith("temp-")) {
    console.log(
      "⚠️ Using temporary conversation. Will not be saved to Firestore."
    );
    return;
  }

  const conversationRef = db.collection("conversations").doc(conversationId);

  const updateData: Record<string, any> = {
    messages: FieldValue.arrayUnion(message),
    updatedAt: Timestamp.now(),
  };

  // If there are metadata updates, merge them with existing metadata
  if (metadataUpdates) {
    // We need to get the current metadata first to merge properly
    const doc = await conversationRef.get();
    if (doc.exists) {
      const currentData = doc.data() as Conversation;
      const currentMetadata = currentData.metadata || {};

      // Deep merge the metadata
      const updatedMetadata = {
        userPreferences: {
          ...currentMetadata.userPreferences,
          ...metadataUpdates.userPreferences,
        },
        context: {
          ...currentMetadata.context,
          ...metadataUpdates.context,
          // Special handling for arrays and objects in context
          recentTopics: [
            ...(metadataUpdates.context?.recentTopics || []),
            ...(currentMetadata.context?.recentTopics || []).slice(0, 5),
          ].slice(0, 10), // Keep only 10 most recent topics
          knownFacts: {
            ...(currentMetadata.context?.knownFacts || {}),
            ...(metadataUpdates.context?.knownFacts || {}),
          },
        },
        assistantSettings: {
          ...currentMetadata.assistantSettings,
          ...metadataUpdates.assistantSettings,
        },
      };

      updateData.metadata = updatedMetadata;
    } else {
      // Make sure we set English as default language if creating new metadata
      if (!metadataUpdates.userPreferences?.preferredLanguage) {
        if (!metadataUpdates.userPreferences) {
          metadataUpdates.userPreferences = {};
        }
        metadataUpdates.userPreferences.preferredLanguage = "en";
      }

      updateData.metadata = metadataUpdates;
    }
  }

  try {
    await conversationRef.update(updateData);
    console.log(`✅ Message added to conversation ${conversationId}`);
  } catch (error) {
    console.error(`❌ Error updating conversation ${conversationId}:`, error);
  }
};

/**
 * Get conversation history
 */
export const getConversationHistory = async (
  conversationId: string,
  limit: number = 10
): Promise<ConversationMessage[]> => {
  // For temporary conversations, return empty array
  if (conversationId.startsWith("temp-")) {
    return [];
  }

  try {
    const conversationRef = db.collection("conversations").doc(conversationId);
    const doc = await conversationRef.get();

    if (!doc.exists) {
      console.log(`⚠️ Conversation ${conversationId} not found`);
      return [];
    }

    const conversation = doc.data() as Conversation;
    // Return most recent messages up to the limit
    return (conversation.messages || []).slice(-limit);
  } catch (error) {
    console.error(
      `❌ Error getting conversation history for ${conversationId}:`,
      error
    );
    return [];
  }
};

/**
 * Extract and update user preferences from message
 */
export const extractUserPreferences = (
  message: string
): Partial<ConversationMetadata> | null => {
  const metadata: Partial<ConversationMetadata> = {
    userPreferences: {},
  };

  // Check for nickname preferences
  const nicknameMatch = message.match(
    /(?:call me|my name is) ["|']?([A-Za-z0-9À-ÿ\s]+)["|']?/i
  );
  if (nicknameMatch && nicknameMatch[1]) {
    metadata.userPreferences!.nickname = nicknameMatch[1].trim();
    console.log(`🔤 Nickname detected: "${nicknameMatch[1].trim()}"`);
    return metadata;
  }

  // Check for language preferences
  const languageMatch = message.match(
    /(?:speak|write|respond|answer) (?:in|using) ([A-Za-z]+)/i
  );
  if (languageMatch && languageMatch[1]) {
    const language = languageMatch[1].toLowerCase();
    if (["spanish", "español", "english"].includes(language)) {
      metadata.userPreferences!.preferredLanguage =
        language === "spanish" || language === "español" ? "es" : "en";
      console.log(
        `🌐 Language detected: ${metadata.userPreferences!.preferredLanguage}`
      );
      return metadata;
    }
  }

  // Check for verbosity preferences
  if (message.match(/(?:be) (concise|brief|direct)/i)) {
    metadata.assistantSettings = { verbosityLevel: "concise" };
    console.log(`📏 Verbosity level detected: concise`);
    return metadata;
  } else if (
    message.match(/(?:give me|provide|i want) (details|detailed information)/i)
  ) {
    metadata.assistantSettings = { verbosityLevel: "detailed" };
    console.log(`📏 Verbosity level detected: detailed`);
    return metadata;
  }

  // If no preferences detected
  return null;
};