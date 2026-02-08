
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // Safely attempt to initialize Gemini
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : '';
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async consultHealth(query: string) {
    if (!this.ai) {
      console.warn("Gemini API Key is missing. AI features disabled.");
      return "দুঃখিত, এআই সার্ভিস কনফিগার করা হয়নি। অনুগ্রহ করে পরে চেষ্টা করুন।";
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `As a professional medical AI assistant for JB Healthcare, answer this query in Bengali: "${query}". 
        Include:
        1. Symptoms (লক্ষণসমূহ)
        2. Primary Treatment/Home Remedies (প্রাথমিক চিকিৎসা)
        3. Prevention (প্রতিকার ও সচেতনতা)
        4. Suggested Lab Tests (প্রয়োজনীয় পরীক্ষা)
        5. Specialist Suggestion (কোন ধরনের ডাক্তার দেখাবেন).
        
        Use bullet points, keep it professional, and always add a disclaimer in Bengali that this is not a substitute for professional medical advice.`,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "দুঃখিত, বর্তমানে এআই পরামর্শ দিতে সমস্যা হচ্ছে। অনুগ্রহ করে সরাসরি ডাক্তার বেছে নিন।";
    }
  }

  async analyzeSymptoms(symptoms: string) {
    return this.consultHealth(symptoms);
  }

  async summarizePrescription(prescriptionText: string) {
    if (!this.ai) return "এআই সার্ভিস পাওয়া যাচ্ছে না।";
    
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize this medical prescription in simple Bengali for the patient. Explain when to take which medicine and any special instructions: "${prescriptionText}"`,
      });
      return response.text;
    } catch (error) {
      return "প্রেসক্রিপশন বুঝতে সমস্যা হচ্ছে।";
    }
  }
}

export const gemini = new GeminiService();
