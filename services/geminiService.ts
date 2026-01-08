import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// Using the provided Gemini API Key directly as requested.
const GEMINI_API_KEY = 'AIzaSyCqs37-6TH6GOgZ4nv3ouLxAoyd3NYvBwU';
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export interface ViralMetadataResponse {
  title: string;
  hashtags: string[];
  description: string;
  viralScoreReasoning: string;
}

/**
 * Simulates analyzing a specific clip's transcript to generate optimized social metadata.
 * Real implementation would process the actual video or audio chunks.
 */
export const generateViralMetadata = async (transcript: string, context: string): Promise<ViralMetadataResponse> => {
  try {
    const prompt = `
      You are a world-class viral content strategist for TikTok, Instagram Reels, and YouTube Shorts.
      Your goal is to maximize Audience Retention and Click-Through Rate (CTR).

      Context: ${context}
      Transcript Segment: "${transcript}"

      Analyze this segment and generate metadata designed to trigger the algorithm.
      
      Requirements:
      1. Title: Must be a "Hook" - curiosity inducing, urgent, or emotional. Max 50 chars. NO generic titles.
      2. Hashtags: Mix of 3 broad (e.g., #fyp) and 3 niche specific tags.
      3. Description: Short, punchy, asking a question to drive comments.
      4. Viral Reasoning: precise psychological trigger used (e.g., "Fear of missing out", "Contrarian opinion", "Relatability").

      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.STRING },
            viralScoreReasoning: { type: Type.STRING },
          },
          required: ["title", "hashtags", "description", "viralScoreReasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as ViralMetadataResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback in case of error or missing key
    return {
      title: "🔥 THIS is why you're failing",
      hashtags: ["#viral", "#mindset", "#growth", "#fyp"],
      description: "You need to hear this today. 👇 #motivation",
      viralScoreReasoning: "Strong emotional hook and direct address to viewer."
    };
  }
};