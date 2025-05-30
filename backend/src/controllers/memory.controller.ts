// controllers/memory.controller.ts
import { Request, Response, NextFunction } from "express";
import { db } from "../models/firebase.model.js";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

/**
 * Extractor de preferencias avanzado para Frida
 * Este extractor identifica diferentes tipos de instrucciones de memoria
 */
export const analyzeUserMessage = async (message: string): Promise<{
  userPreference?: any;
  entityDetection?: any;
  actionRequest?: any;
}> => {
  const result: {
    userPreference?: any;
    entityDetection?: any;
    actionRequest?: any;
  } = {};
  
  // DETECCIÓN DE PREFERENCIAS DE USUARIO
  
  // Detección de apodos (nickname)
  const nicknamePatterns = [
    /llámame\s+(?:como|)\s*["|']?([A-Za-zÀ-ÿ0-9\s]+)["|']?/i,
    /mi(?:\s+nuevo|\s+)\s*nombre\s+es\s+["|']?([A-Za-zÀ-ÿ0-9\s]+)["|']?/i,
    /dime\s+["|']?([A-Za-zÀ-ÿ0-9\s]+)["|']?/i,
    /quiero\s+que\s+me\s+llames\s+["|']?([A-Za-zÀ-ÿ0-9\s]+)["|']?/i,
    /prefiero\s+que\s+me\s+llames\s+["|']?([A-Za-zÀ-ÿ0-9\s]+)["|']?/i
  ];
  
  for (const pattern of nicknamePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      result.userPreference = { 
        nickname: match[1].trim() 
      };
      break;
    }
  }
  
  // Detección de preferencia de idioma
  const languagePatterns = [
    /(?:habla|escribe|responde)\s+(?:en|using)\s+([A-Za-zÀ-ÿ]+)/i,
    /(?:cambia|cambiar)\s+(?:el|)\s*idioma\s+(?:a|al|para)\s+([A-Za-zÀ-ÿ]+)/i,
    /(?:prefiero|quiero)\s+que\s+(?:me\s+hables|hables|respondas)\s+en\s+([A-Za-zÀ-ÿ]+)/i
  ];
  
  for (const pattern of languagePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const lang = match[1].toLowerCase();
      let langCode = '';
      
      if (['español', 'castellano', 'spanish'].includes(lang)) {
        langCode = 'es';
      } else if (['inglés', 'ingles', 'english'].includes(lang)) {
        langCode = 'en';
      } else if (['francés', 'frances', 'french'].includes(lang)) {
        langCode = 'fr';
      } else if (['portugués', 'portugues', 'portuguese'].includes(lang)) {
        langCode = 'pt';
      }
      
      if (langCode) {
        result.userPreference = {
          ...result.userPreference,
          preferredLanguage: langCode
        };
        break;
      }
    }
  }
  
  // Detección de nivel de detalle preferido
  if (message.match(/(?:sé|se|quiero\s+que\s+seas)\s+(breve|conciso|directo)/i)) {
    result.userPreference = {
      ...result.userPreference,
      verbosityLevel: 'concise'
    };
  } else if (message.match(/(?:dame|proporciona|quiero)\s+(detalles|información detallada|explicación completa)/i)) {
    result.userPreference = {
      ...result.userPreference,
      verbosityLevel: 'detailed'
    };
  }
  
  // DETECCIÓN DE ENTIDADES
  
  // Detectar nombres de personas mencionadas
  const peopleMatches = message.match(/(?:sobre|acerca de|mencionaste|hablaste de|quien es|quién es)\s+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+){0,2})/g);
  if (peopleMatches) {
    result.entityDetection = {
      people: peopleMatches.map(match => {
        const name = match.replace(/(?:sobre|acerca de|mencionaste|hablaste de|quien es|quién es)\s+/i, '').trim();
        return name;
      })
    };
  }
  
  // Detectar solicitudes de acción
  if (message.match(/recuerda(?:\s+que|\s+esto|:|\s+lo\s+siguiente)/i)) {
    const factMatch = message.match(/recuerda(?:\s+que|\s+esto|:|\s+lo\s+siguiente)\s+(.+)$/i);
    if (factMatch && factMatch[1]) {
      result.actionRequest = {
        type: 'remember',
        content: factMatch[1].trim()
      };
    }
  }
  
  return result;
};

/**
 * Extraer hechos importantes del mensaje del asistente para recordarlos
 */
export const extractFactsFromAssistantMessage = (message: string): Record<string, any> => {
  const facts: Record<string, any> = {};
  
  // Ejemplo: detectar "X es responsable de Y" para recordar responsabilidades
  const responsibilityMatches = message.match(/([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+){0,2})\s+es(?:\s+el|la)?\s+responsable\s+de\s+([^\.]+)/gi);
  
  if (responsibilityMatches) {
    facts.responsibilities = {};
    responsibilityMatches.forEach(match => {
      const parts = match.split(/\s+es(?:\s+el|la)?\s+responsable\s+de\s+/i);
      if (parts.length === 2) {
        const person = parts[0].trim();
        const task = parts[1].trim();
        facts.responsibilities[person] = task;
      }
    });
  }
  
  // Detectar fechas importantes mencionadas
  const dateMatches = message.match(/(?:el|la|para el|para la)\s+(\d{1,2}\s+de\s+[a-zà-ÿ]+(?:\s+de\s+\d{4})?)/gi);
  if (dateMatches) {
    facts.importantDates = dateMatches.map(match => 
      match.replace(/(?:el|la|para el|para la)\s+/i, '').trim()
    );
  }
  
  return facts;
};

/**
 * Middleware para añadir los componentes de memoria a la respuesta del asistente
 */
export const memoryEnhancementMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  // La lógica aquí sería para procesar cualquier solicitud entrante
  // antes de pasarla al controlador principal
  // Puede usarse para preprocesar la entrada o postprocesar la salida
  
  const originalSend = res.send;
  
  // Sobrescribir el método send para procesar la respuesta
  res.send = function(body: any): Response {
    // Aquí se podría agregar lógica para enriquecer la respuesta
    // con información de memoria cuando sea necesario
    
    // Ejemplo: añadir un indicador de que esta respuesta ha sido mejorada con memoria
    if (typeof body === 'string') {
      try {
        const jsonBody = JSON.parse(body);
        if (jsonBody.reply) {
          jsonBody.memoryEnhanced = true;
          return originalSend.call(this, JSON.stringify(jsonBody));
        }
      } catch (e) {
        // Si no es JSON, dejarlo pasar sin cambios
      }
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};