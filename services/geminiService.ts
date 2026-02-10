
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  async consultHealth(query: string) {
    // Correctly initialize with environment variable at the time of calling
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `As a professional medical AI assistant for JB Healthcare, answer this query in simple and helpful Bengali: "${query}". 
        Include:
        1. Possible Symptoms (সম্ভাব্য লক্ষণ)
        2. Home Remedies (ঘরোয়া পরামর্শ)
        3. Professional Disclaimer (সতর্কবার্তা: এটি ডাক্তারের বিকল্প নয়).
        Use clean formatting with bullet points.`,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "দুঃখিত, এআই সার্ভিস এই মুহূর্তে উত্তর দিতে পারছে না। অনুগ্রহ করে সরাসরি ডাক্তার বেছে নিন বা আপনার ইন্টারনেট কানেকশন চেক করুন।";
    }
  }
}

export const gemini = new GeminiService();
