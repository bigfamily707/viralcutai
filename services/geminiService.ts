import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client with Environment Variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ViralMetadataResponse {
  title: string;
  hashtags: string[];
  description: string;
  viralScoreReasoning: string;
}

export const generateViralMetadata = async (transcript: string, context: string): Promise<ViralMetadataResponse> => {
  try {
    // Optimized prompt for speed (fewer output tokens requested implicitly)
    const prompt = `
      Act as a viral content expert.
      Context: ${context}
      Transcript: "${transcript.substring(0, 500)}"

      Generate social metadata.
      1. Title: High-CTR hook (max 50 chars).
      2. Hashtags: 4 tags.
      3. Description: 1 sentence.
      4. Reasoning: 1 sentence on why it goes viral.
      
      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Using a fast model compatible with the new SDK
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
    if (!text) throw new Error("No response");
    
    return JSON.parse(text) as ViralMetadataResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if API key is missing or quota exceeded during demo
    return {
      title: "🔥 Must Watch Clip",
      hashtags: ["#viral", "#shorts", "#fyp"],
      description: "Check this out! 👇",
      viralScoreReasoning: "High energy segment."
    };
  }
};