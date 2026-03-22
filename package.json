import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateChatResponse(prompt: string, fileData?: { data: string, mimeType: string }) {
  const parts: any[] = [{ text: prompt }];
  if (fileData) {
    parts.unshift({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
  }
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts }
  });
  
  return response.text;
}

export async function generateSummary(text: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Please provide a comprehensive and structured summary of the following text:\n\n${text}`,
    config: {
      systemInstruction: "You are a professional academic summarizer. Provide clear, concise, and structured summaries with bullet points for key takeaways."
    }
  });
  return response.text;
}

export async function generateQuiz(topic: string, numQuestions: number) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a multiple-choice quiz about ${topic} with exactly ${numQuestions} questions. Each question must have exactly 4 options and one correct answer.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswerIndex: { type: Type.INTEGER, description: "0-based index of the correct option" },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
      }
    }
  });
  
  return JSON.parse(response.text || "[]");
}

export async function generateStudyPlan(goals: string, hoursPerDay: number, days: number) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a detailed study plan for ${days} days, studying ${hoursPerDay} hours per day. The goals are: ${goals}.`,
    config: {
      systemInstruction: "You are an expert study planner. Create a realistic, structured, and actionable day-by-day study schedule. Use markdown for formatting.",
    }
  });
  return response.text;
}
