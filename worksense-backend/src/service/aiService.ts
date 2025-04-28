// import axios from 'axios';

// interface AiPayload {
//   prompt: string;
//   data: {
//     projectName: string;
//     projectDescription: string;
//   };
// }

// export const generateItemWithAI = async (payload: AiPayload): Promise<any> => {
//   try {
//     const response = await axios.post('https://stk-formador-25.azurewebsites.net/epics/generate-from-prompt/', payload);
//     return response.data;
//   } catch (error: any) {
//     console.error('Error llamando a la IA:', error);
//     throw new Error('Fallo al generar ítems con IA');
//   }
// };

import axios from 'axios';

interface AiPayload {
  prompt: string;
}

interface FridaResponse {
  success: boolean;
  data: string;
  message?: string;
  error?: any;
}

const FRIDA_URL = process.env.FRIDA_API_URL;
if (!FRIDA_URL) {
  throw new Error('FRIDA_API_URL no está definida en las variables de entorno');
}

export async function generateItemWithAI({ prompt }: AiPayload): Promise<string> {
  try {
    const response = await axios.post<FridaResponse>(
      `${FRIDA_URL}/epics/generate-from-prompt/`,
      // Cuerpo con prompt + data vacío
      { prompt, data: {} },
      {
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json' 
        }
      }
    );

    if (!response.data.success) {
      throw new Error(`IA respondió con un error: ${JSON.stringify(response.data)}`);
    }

    if (typeof response.data.data !== 'string') {
        throw new Error('La respuesta de IA no es una cadena de texto válida');
    }

    return response.data.data;
  } catch (err: any) {
    console.error('Error generando con IA:', err.response?.data || err.message);
    throw new Error('Error al generar ítems con IA');
  }
}