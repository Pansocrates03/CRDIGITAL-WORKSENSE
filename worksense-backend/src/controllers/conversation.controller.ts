// controllers/conversation.controller.ts with English as default language
import { Request, Response, NextFunction } from "express";
import { db } from "../models/firebase.js";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import {
  Conversation,
  ConversationMessage,
  ConversationMetadata,
} from "../../types/conversation.js";

// Consigue o crea una conversación para un usuario y proyecto específicos
export const getOrCreateConversation = async (
  userId: number,
  projectId: string
): Promise<Conversation> => {
  console.log(
    `🔍 Looking for conversation for user ${userId} in project ${projectId}`
  );

  try {
    // Buscar la colección de conversaciones
    const conversationsRef = db.collection("conversations");

    try {
      const querySnapshot = await conversationsRef
        .where("userId", "==", userId)
        .where("projectId", "==", projectId)
        .orderBy("updatedAt", "desc")
        .limit(1)
        .get();

      // Si la comversación existe, devolverla
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
        } as Conversation;
      }
    } catch (indexError: any) {
      if (
        indexError.message &&
        indexError.message.includes("FAILED_PRECONDITION")
      ) {
        const simpleQuerySnapshot = await conversationsRef
          .where("userId", "==", userId)
          .where("projectId", "==", projectId)
          .get();

        if (!simpleQuerySnapshot.empty) {
          // Busca el documento más reciente
          let mostRecentDoc = simpleQuerySnapshot.docs[0];
          let mostRecentTime = mostRecentDoc.data().updatedAt?.toMillis() || 0;

          simpleQuerySnapshot.docs.forEach((doc) => {
            const updateTime = doc.data().updatedAt?.toMillis() || 0;
            if (updateTime > mostRecentTime) {
              mostRecentDoc = doc;
              mostRecentTime = updateTime;
            }
          });
          return {
            id: mostRecentDoc.id,
            ...mostRecentDoc.data(),
          } as Conversation;
        }
      } else {
        throw indexError;
      }
    }

    const newConversation: Omit<Conversation, "id"> = {
      projectId,
      userId,
      messages: [],
      metadata: {
        userPreferences: {
          preferredLanguage: "en",
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

    return {
      id: docRef.id,
      ...newConversation,
    };
  } catch (error) {

    return {
      id: `temp-${Date.now()}`,
      projectId,
      userId,
      messages: [],
      metadata: {
        userPreferences: {
          preferredLanguage: "en", 
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

// Agrega un mensaje a la conversación y actualizar la metadata si es necesario
export const addMessageToConversation = async (
  conversationId: string,
  message: ConversationMessage,
  metadataUpdates?: Partial<ConversationMetadata>
): Promise<void> => {
  if (conversationId.startsWith("temp-")) {
    return;
  }

  const conversationRef = db.collection("conversations").doc(conversationId);

  const updateData: Record<string, any> = {
    messages: FieldValue.arrayUnion(message),
    updatedAt: Timestamp.now(),
  };

  // Si hay actualizaciones de metadata, se mezclan con la metadata actual
  if (metadataUpdates) {
    const doc = await conversationRef.get();
    if (doc.exists) {
      const currentData = doc.data() as Conversation;
      const currentMetadata = currentData.metadata || {};

      const updatedMetadata = {
        userPreferences: {
          ...currentMetadata.userPreferences,
          ...metadataUpdates.userPreferences,
        },
        context: {
          ...currentMetadata.context,
          ...metadataUpdates.context,
          recentTopics: [
            ...(metadataUpdates.context?.recentTopics || []),
            ...(currentMetadata.context?.recentTopics || []).slice(0, 5),
          ].slice(0, 10), // Mantener un máximo de 10 temas recientes
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
  } catch (error) {
  }
};


export const getConversationHistory = async (
  conversationId: string,
  limit: number = 10
): Promise<ConversationMessage[]> => {
  if (conversationId.startsWith("temp-")) {
    return [];
  }

  try {
    const conversationRef = db.collection("conversations").doc(conversationId);
    const doc = await conversationRef.get();

    if (!doc.exists) {
      return [];
    }

    const conversation = doc.data() as Conversation;
    return (conversation.messages || []).slice(-limit);
  } catch (error) {
    return [];
  }
};

// Extrae las preferencias del usuario de un mensaje y actualiza la metadata de la conversación
export const extractUserPreferences = (
  message: string
): Partial<ConversationMetadata> | null => {
  const metadata: Partial<ConversationMetadata> = {
    userPreferences: {},
  };

  const nicknameMatch = message.match(
    /(?:call me|my name is) ["|']?([A-Za-z0-9À-ÿ\s]+)["|']?/i
  );
  if (nicknameMatch && nicknameMatch[1]) {
    metadata.userPreferences!.nickname = nicknameMatch[1].trim();
    return metadata;
  }

  const languageMatch = message.match(
    /(?:speak|write|respond|answer) (?:in|using) ([A-Za-z]+)/i
  );
  if (languageMatch && languageMatch[1]) {
    const language = languageMatch[1].toLowerCase();
    if (["spanish", "español", "english"].includes(language)) {
      metadata.userPreferences!.preferredLanguage =
        language === "spanish" || language === "español" ? "es" : "en";
      return metadata;
    }
  }

  if (message.match(/(?:be) (concise|brief|direct)/i)) {
    metadata.assistantSettings = { verbosityLevel: "concise" };
    return metadata;
  } else if (
    message.match(/(?:give me|provide|i want) (details|detailed information)/i)
  ) {
    metadata.assistantSettings = { verbosityLevel: "detailed" };
    return metadata;
  }

  return null;
};