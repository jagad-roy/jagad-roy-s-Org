
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    try {
      const apiKey = process.env.API_KEY;
      if (apiKey) {
        this.ai = new GoogleGenAI({ apiKey });
      } else {
        console.warn("API_KEY is missing in process.env");
      }
    } catch (e) {
      console.error("Gemini initialization failed:", e);
    }
  }

  async consultHealth(query: string) {
    if (!this.ai) {
      return "দুঃখিত, এআই সার্ভিস বর্তমানে কনফিগার করা হয়নি। অনুগ্রহ করে পরে চেষ্টা করুন।";
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite-latest',
        contents: `As a professional medical AI assistant for JB Healthcare, answer this query in simple Bengali: "${query}". 
        Include basic symptoms, home care tips, and a disclaimer that this is not a doctor's substitute.`,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "দুঃখিত, এআই সার্ভিস এই মুহূর্তে উত্তর দিতে পারছে না। অনুগ্রহ করে সরাসরি ডাক্তার বেছে নিন।";
    }
  }
}

export const gemini = new GeminiService();
