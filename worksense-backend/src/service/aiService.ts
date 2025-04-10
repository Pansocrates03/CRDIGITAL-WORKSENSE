import axios from 'axios';

interface AiPayload {
  prompt: string;
  data: {
    projectName: string;
    projectDescription: string;
  };
}

export const generateItemWithAI = async (payload: AiPayload): Promise<any> => {
  try {
    const response = await axios.post('https://stk-formador-25.azurewebsites.net/epics/generate-from-prompt/', payload);
    return response.data;
  } catch (error: any) {
    console.error('Error llamando a la IA:', error);
    throw new Error('Fallo al generar ítems con IA');
  }
};
