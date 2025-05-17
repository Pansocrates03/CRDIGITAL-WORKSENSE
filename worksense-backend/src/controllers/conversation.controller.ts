// controllers/conversation.controller.ts con inglés como idioma predeterminado
import { Request, Response, NextFunction } from "express";
import { db } from "../models/firebase.js";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { Conversation, ConversationMessage, ConversationMetadata } from "../../types/conversation.js";

/**
 * Get or create a conversation for a user in a project
 */
export const getOrCreateConversation = async (
  userId: number,
  projectId: string
): Promise<Conversation> => {
  console.log(`🔍 Buscando conversación para usuario ${userId} en proyecto ${projectId}`);
  
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
        console.log(`✅ Conversación existente encontrada: ${doc.id}`);
        return {
          id: doc.id,
          ...doc.data()
        } as Conversation;
      }
    } catch (indexError: any) {
      // If it's specifically an index error, try a simpler query
      if (indexError.message && indexError.message.includes("FAILED_PRECONDITION")) {
        console.log("⚠️ Error de índice en Firestore. Intentando consulta alternativa...");
        
        // Try simpler query without sorting
        const simpleQuerySnapshot = await conversationsRef
          .where("userId", "==", userId)
          .where("projectId", "==", projectId)
          .get();
        
        if (!simpleQuerySnapshot.empty) {
          // Find the most recently updated document manually
          let mostRecentDoc = simpleQuerySnapshot.docs[0];
          let mostRecentTime = mostRecentDoc.data().updatedAt?.toMillis() || 0;
          
          simpleQuerySnapshot.docs.forEach(doc => {
            const updateTime = doc.data().updatedAt?.toMillis() || 0;
            if (updateTime > mostRecentTime) {
              mostRecentDoc = doc;
              mostRecentTime = updateTime;
            }
          });
          
          console.log(`✅ Conversación existente encontrada (consulta alternativa): ${mostRecentDoc.id}`);
          return {
            id: mostRecentDoc.id,
            ...mostRecentDoc.data()
          } as Conversation;
        }
      } else {
        // If it's not an index error, rethrow
        throw indexError;
      }
    }
    
    // If we reach here, we need to create a new conversation
    console.log("🆕 Creando nueva conversación...");
    
    // CHANGE: Set default language to English ('en')
    const newConversation: Omit<Conversation, "id"> = {
      projectId,
      userId,
      messages: [],
      metadata: {
        userPreferences: {
          preferredLanguage: 'en' // Default to English
        },
        context: {
          recentTopics: [],
          lastDiscussedItems: [],
          knownFacts: {}
        },
        assistantSettings: {
          verbosityLevel: "normal"
        }
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await conversationsRef.add(newConversation);
    console.log(`✅ Nueva conversación creada con ID: ${docRef.id}`);
    
    return {
      id: docRef.id,
      ...newConversation
    };
  } catch (error) {
    console.error("❌ Error en getOrCreateConversation:", error);
    
    // Create a temporary conversation object with English as default
    return {
      id: `temp-${Date.now()}`,
      projectId,
      userId,
      messages: [],
      metadata: {
        userPreferences: {
          preferredLanguage: 'en' // Default to English
        },
        context: { 
          recentTopics: [], 
          lastDiscussedItems: [], 
          knownFacts: {} 
        },
        assistantSettings: { 
          verbosityLevel: "normal" 
        }
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
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
  if (conversationId.startsWith('temp-')) {
    console.log('⚠️ Usando conversación temporal. No se guardará en Firestore.');
    return;
  }
  
  const conversationRef = db.collection("conversations").doc(conversationId);
  
  const updateData: Record<string, any> = {
    messages: FieldValue.arrayUnion(message),
    updatedAt: Timestamp.now()
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
          ...metadataUpdates.userPreferences
        },
        context: {
          ...currentMetadata.context,
          ...metadataUpdates.context,
          // Special handling for arrays and objects in context
          recentTopics: [
            ...(metadataUpdates.context?.recentTopics || []),
            ...(currentMetadata.context?.recentTopics || []).slice(0, 5)
          ].slice(0, 10), // Keep only 10 most recent topics
          knownFacts: {
            ...(currentMetadata.context?.knownFacts || {}),
            ...(metadataUpdates.context?.knownFacts || {})
          }
        },
        assistantSettings: {
          ...currentMetadata.assistantSettings,
          ...metadataUpdates.assistantSettings
        }
      };
      
      updateData.metadata = updatedMetadata;
    } else {
      // Make sure we set English as default language if creating new metadata
      if (!metadataUpdates.userPreferences?.preferredLanguage) {
        if (!metadataUpdates.userPreferences) {
          metadataUpdates.userPreferences = {};
        }
        metadataUpdates.userPreferences.preferredLanguage = 'en';
      }
      
      updateData.metadata = metadataUpdates;
    }
  }
  
  try {
    await conversationRef.update(updateData);
    console.log(`✅ Mensaje añadido a la conversación ${conversationId}`);
  } catch (error) {
    console.error(`❌ Error al actualizar la conversación ${conversationId}:`, error);
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
  if (conversationId.startsWith('temp-')) {
    return [];
  }
  
  try {
    const conversationRef = db.collection("conversations").doc(conversationId);
    const doc = await conversationRef.get();
    
    if (!doc.exists) {
      console.log(`⚠️ Conversación ${conversationId} no encontrada`);
      return [];
    }
    
    const conversation = doc.data() as Conversation;
    // Return most recent messages up to the limit
    return (conversation.messages || []).slice(-limit);
  } catch (error) {
    console.error(`❌ Error al obtener el historial de la conversación ${conversationId}:`, error);
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
    userPreferences: {}
  };
  
  // Check for nickname preferences
  const nicknameMatch = message.match(/(?:llámame|llama me|mi nombre es|dime|call me|my name is) ["|']?([A-Za-z0-9À-ÿ\s]+)["|']?/i);
  if (nicknameMatch && nicknameMatch[1]) {
    metadata.userPreferences!.nickname = nicknameMatch[1].trim();
    console.log(`🔤 Nickname detectado: "${nicknameMatch[1].trim()}"`);
    return metadata;
  }
  
  // Check for language preferences - expanded to include English phrases
  const languageMatch = message.match(/(?:habla|escribe|responde|speak|write|respond|answer) (?:en|in|using) ([A-Za-z]+)/i);
  if (languageMatch && languageMatch[1]) {
    const language = languageMatch[1].toLowerCase();
    if (["español", "spanish", "inglés", "ingles", "english"].includes(language)) {
      metadata.userPreferences!.preferredLanguage = 
        (language === "español" || language === "spanish") ? 'es' : 'en';
      console.log(`🌐 Idioma detectado: ${metadata.userPreferences!.preferredLanguage}`);
      return metadata;
    }
  }
  
  // Check for verbosity preferences - expanded to include English phrases
  if (message.match(/(?:sé|se|be) (breve|conciso|directo|concise|brief|direct)/i)) {
    metadata.assistantSettings = { verbosityLevel: "concise" };
    console.log(`📏 Nivel de verbosidad detectado: conciso`);
    return metadata;
  } else if (message.match(/(?:dame|proporciona|quiero|give me|provide|i want) (detalles|información detallada|details|detailed information)/i)) {
    metadata.assistantSettings = { verbosityLevel: "detailed" };
    console.log(`📏 Nivel de verbosidad detectado: detallado`);
    return metadata;
  }
  
  // If no preferences detected
  return null;
};