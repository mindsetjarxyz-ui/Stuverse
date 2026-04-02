import { GoogleGenAI, Type } from '@google/genai';

const getAiInstance = () => {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
                 (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || 
                 '';
  return new GoogleGenAI({ apiKey });
};

export const generateCompletion = async (prompt: string, language = 'English', model = 'gemini-3.1-pro-preview') => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model,
      contents: `${prompt}\n\nIMPORTANT: Please respond in ${language}.`,
    });
    return response.text;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw error;
  }
};

export const generateCompletionStream = async function* (prompt: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[] = [], language = 'English', model = 'gemini-3.1-pro-preview', systemInstruction?: string) {
  try {
    const ai = getAiInstance();
    const responseStream = await ai.models.generateContentStream({
      model,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: `${prompt}\n\nIMPORTANT: Please respond in ${language}.` }] }
      ],
      config: systemInstruction ? { systemInstruction } : undefined
    });
    for await (const chunk of responseStream) {
      yield chunk.text;
    }
  } catch (error) {
    console.error('AI Stream Error:', error);
    throw error;
  }
};

export const generateQuiz = async (topic: string, count: number, difficulty: string, language: string = 'English') => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Generate a multiple choice quiz about ${topic} with ${count} questions at a ${difficulty} difficulty level. 
      The output language must be ${language}. 
      CRITICAL: Ensure that the 'correctAnswerIndex' is randomized across all questions (do not always pick the same index like 1 or 2).`,
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
              correctAnswerIndex: { type: Type.INTEGER, description: "0-based index of the correct option (0-3)" },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      }
    });
    let text = response.text || '[]';
    // Remove markdown code blocks if present
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    return JSON.parse(text);
  } catch (error) {
    console.error('Quiz Generation Error:', error);
    throw error;
  }
};

export const analyzeDocument = async (fileData: string, mimeType: string, prompt: string, language = 'English') => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: fileData, mimeType } },
          { text: `${prompt}\n\nIMPORTANT: Please respond in ${language}.` }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error('Document Analysis Error:', error);
    throw error;
  }
};

export const analyzeDocumentStream = async function* (fileData: string, mimeType: string, prompt: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[] = [], language = 'English', systemInstruction?: string) {
  try {
    const ai = getAiInstance();
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.1-pro-preview',
      contents: [
        ...history,
        {
          role: 'user',
          parts: [
            { inlineData: { data: fileData, mimeType } },
            { text: `${prompt}\n\nIMPORTANT: Please respond in ${language}.` }
          ]
        }
      ],
      config: systemInstruction ? { systemInstruction } : undefined
    });
    for await (const chunk of responseStream) {
      yield chunk.text;
    }
  } catch (error) {
    console.error('Document Analysis Stream Error:', error);
    throw error;
  }
};

export const generateNotesFromFile = async (fileData: string, mimeType: string, language = 'English') => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: fileData, mimeType } },
          { text: `Please analyze this file (audio, video, or document) and provide a well-structured, bullet-point summary of the key notes. Use Markdown for formatting. Include a 'Summary' section and a 'Key Takeaways' section. IMPORTANT: Please respond in ${language}.` }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error('File Notes Generation Error:', error);
    throw error;
  }
};
