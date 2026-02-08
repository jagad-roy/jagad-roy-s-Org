
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Correctly initialize with environment variable
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async consultHealth(query: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite-latest',
        contents: `As a professional medical AI assistant for JB Healthcare, answer this query in Bengali: "${query}". 
        Include:
        1. Symptoms (লক্ষণসমূহ)
        2. Primary Treatment (প্রাথমিক চিকিৎসা)
        3. Prevention (প্রতিকার)
        4. Disclaimer in Bengali.
        Keep the language simple and helpful.`,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "দুঃখিত, এআই সার্ভিস কানেক্ট করতে সমস্যা হচ্ছে। অনুগ্রহ করে আপনার ইন্টারনেট কানেকশন চেক করুন।";
    }
  }

  async analyzeSymptoms(symptoms: string) {
    return this.consultHealth(symptoms);
  }
}

export const gemini = new GeminiService();
