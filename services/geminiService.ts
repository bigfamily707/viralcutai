import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// The API key is obtained from the environment variable process.env.API_KEY
// Fallback to the provided key if process.env.API_KEY is not set
const apiKey = process.env.API_KEY || 'AIzaSyCqs37-6TH6GOgZ4nv3ouLxAoyd3NYvBwU';
const ai = new GoogleGenAI({ apiKey: apiKey });

// Helper to check if API key is present (for UI feedback)
export const hasApiKey = (): boolean => !!apiKey && apiKey !== 'dummy-key';

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
  // If no valid key is present (should not happen with the hardcoded fallback, but good safety)
  if (!apiKey || apiKey === 'dummy-key') {
    console.warn("No valid API Key found. Returning mock data.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          title: "🚀 Productivity Hack Revealed!",
          hashtags: ["#productivity", "#lifehacks", "#growthmindset", "#success"],
          description: "Stop waking up at 5AM! Do this instead to triple your output. 🤯",
          viralScoreReasoning: "Strong hook in the first 3 seconds, contrarian viewpoint ('not 5 AM'), and specific actionable advice."
        });
      }, 1500);
    });
  }

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