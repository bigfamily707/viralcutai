import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// The API key is obtained from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      You are an expert social media manager for Instagram Reels and TikTok.
      Analyze the following transcript segment from a video clip.
      
      Context: ${context}
      Transcript: "${transcript}"

      Generate JSON output with:
      1. A catchy, clickbait-style title (max 50 chars).
      2. 5 high-traffic viral hashtags relevant to the content.
      3. A short, engaging caption/description for the post.
      4. A brief reasoning (1 sentence) why this content might go viral.
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
    // Fallback in case of error
    return {
      title: "🔥 Check this out!",
      hashtags: ["#viral", "#trending", "#mustwatch"],
      description: "You won't believe this tip.",
      viralScoreReasoning: "Could not analyze deeply, but contains energetic speech patterns."
    };
  }
};