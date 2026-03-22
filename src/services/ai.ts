import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateCompletion = async (prompt: string, model = 'gemini-3-flash-preview') => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw error;
  }
};

export const generateCompletionStream = async function* (prompt: string, model = 'gemini-3-flash-preview') {
  try {
    const responseStream = await ai.models.generateContentStream({
      model,
      contents: prompt,
    });
    for await (const chunk of responseStream) {
      yield chunk.text;
    }
  } catch (error) {
    console.error('AI Stream Error:', error);
    throw error;
  }
};

export const generateQuiz = async (topic: string, count: number, difficulty: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a multiple choice quiz about ${topic} with ${count} questions at a ${difficulty} difficulty level.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 4 options"
              },
              correctAnswerIndex: { type: Type.INTEGER, description: "0-based index of the correct option" },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error('Quiz Generation Error:', error);
    throw error;
  }
};

export const analyzeDocument = async (fileData: string, mimeType: string, prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: fileData, mimeType } },
          { text: prompt }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error('Document Analysis Error:', error);
    throw error;
  }
};

export const analyzeDocumentStream = async function* (fileData: string, mimeType: string, prompt: string) {
  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: fileData, mimeType } },
          { text: prompt }
        ]
      }
    });
    for await (const chunk of responseStream) {
      yield chunk.text;
    }
  } catch (error) {
    console.error('Document Analysis Stream Error:', error);
    throw error;
  }
};
