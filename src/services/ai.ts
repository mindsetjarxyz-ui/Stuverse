import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateCompletion = async (prompt: string, language = 'English', model = 'gemini-3.1-flash-lite-preview') => {
  try {
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

export const generateCompletionStream = async function* (prompt: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[] = [], language = 'English', model = 'gemini-3.1-flash-lite-preview') {
  try {
    const responseStream = await ai.models.generateContentStream({
      model,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: `${prompt}\n\nIMPORTANT: Please respond in ${language}.` }] }
      ]
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
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
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
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error('Quiz Generation Error:', error);
    throw error;
  }
};

export const analyzeDocument = async (fileData: string, mimeType: string, prompt: string, language = 'English') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
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

export const analyzeDocumentStream = async function* (fileData: string, mimeType: string, prompt: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[] = [], language = 'English') {
  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.1-flash-lite-preview',
      contents: {
        parts: [
          ...history.flatMap(h => h.parts),
          { inlineData: { data: fileData, mimeType } },
          { text: `${prompt}\n\nIMPORTANT: Please respond in ${language}.` }
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

export const transcribeAudio = async (audioData: string, mimeType: string, language = 'English') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: {
        parts: [
          { inlineData: { data: audioData, mimeType } },
          { text: `Please transcribe this lecture audio and then provide a well-structured, bullet-point summary of the key notes. Use Markdown for formatting. Include a 'Summary' section and a 'Key Takeaways' section. IMPORTANT: Please respond in ${language}.` }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error('Audio Transcription Error:', error);
    throw error;
  }
};
