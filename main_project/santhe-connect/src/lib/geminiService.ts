import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI features will be disabled.");
      return null;
    }
    genAI = new GoogleGenAI(apiKey);
  }
  return genAI;
}

export async function getLocalRecommendations(location: string, preferences: string) {
  try {
    const ai = getGenAI();
    if (!ai) return "Karnataka's secrets are waiting for you!";

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`You are a local Karnataka travel expert for the app 'Santhe-Connect'. 
      Based on the location "${location}" and preferences "${preferences}", suggest 3 unique "local flavor" experiences.
      Focus on:
      1. A specific Santhe (weekly market) and why it's special.
      2. A local eatery (Khanavali or Mess) and a dish to try (like Jolada Rotti or Thatte Idli).
      3. A local specialty to buy (honey, hand-woven items).
      
      Format as a short, poetic list with emojis. Mention local names in Kannada script if possible.`);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Exploring Karnataka's soul... check back soon for local tips!";
  }
}
