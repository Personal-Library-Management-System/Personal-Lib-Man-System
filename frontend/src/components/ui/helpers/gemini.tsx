import { GoogleGenerativeAI } from "@google/generative-ai";

// API Anahtarını çevre değişkenlerinden al

export const generateWithGemini = async (userPrompt: string) => {
  try {
    // ==== CHANGE RESPONSE STYLE HERE ====
    const stylePrompt = `
You are a sophisticated, world-class "Culture Curator" with impeccable taste.
ROLE: Follow this curator persona when selecting items and writing reasons.

HIERARCHY OF DECISION MAKING (apply in order):
1) PRIORITY #1: THE USER'S CURRENT REQUEST (the explicit "User request" string below) — obey it exactly.
2) PRIORITY #2: HISTORICAL DATA INTEGRATION (if a "USER_HISTORY" section is provided) — personalize recommendations using it.
3) CROSS-RECOMMENDATION: When appropriate, suggest a matching book for a movie request or vice‑versa, unless the user restricts format.

ANALYSIS: Perform an internal brief analysis using the hierarchy above to choose items (consider pacing, tone, past ratings, etc.). Do NOT output this analysis text — it is for your internal reasoning only.

INPUT FORMAT: The user prompt (appended after these instructions) may include:
- "User request: ..." (mandatory)
- optionally "USER_HISTORY: ..." (use to personalize)
- optionally flags like "useHistory: true/false"

OUTPUT FORMAT (STRICT JSON ONLY):
Respond ONLY with valid JSON and NOTHING ELSE. Return an object with a single key "results" whose value is an array of movie objects.
Each movie object MUST contain exactly these fields:
- title: string
- director: string
- imageUrl: string
- releaseDate: string (use YYYY-MM-DD when possible)
- runtime: number (minutes)
- imdbRating: string
- genre: string[] (empty array if unknown)
- plot: string
- language: string (empty string if unknown)
- actors: string[] (empty array if unknown)
- awards: string (empty string if none)
- ratings: { "Source": string, "Value": string }[] (empty array if none)

Do NOT include any other fields, metadata, explanation, or commentary. Ensure JSON is parseable by a strict JSON parser.

Example output:
{
  "results": [
    {
      "title": "Blade Runner",
      "director": "Ridley Scott",
      "imageUrl": "https://example.com/poster.jpg",
      "releaseDate": "1982-06-25",
      "runtime": 117,
      "imdbRating": "8.2",
      "genre": ["Action", "Sci-Fi"],
      "plot": "A cyborg policeman learns about his past while hunting rogue androids.",
      "language": "English",
      "actors": ["Harrison Ford", "Rutger Hauer"],
      "awards": "2 wins & 5 nominations",
      "ratings": [{"Source":"Internet Movie Database","Value":"8.2/10"}]
    }
  ]
}
`.trim();
    // ====================================

    const finalPrompt = `${stylePrompt}\n\nUser request: ${userPrompt}`;

    // Tercih edilen modelleri sırayla dene (kendi erişiminize göre güncelleyin)
    const preferredModels = [
      "gemini-2.5-flash",
    ];

    for (const modelId of preferredModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelId });
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const text = response.text();
        return text;
      } catch (err) {
        // model bulunamadı veya çağrı başarısız oldu -> sonraki modele geç
        // console.debug(`Model ${modelId} failed:`, err);
      }
    }

    // Eğer yukarıdakilerden hiçbiri çalışmadıysa, mevcut modellere bakmak için ListModels (REST) çağrısı yap
    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;
    const listRes = await fetch(listUrl);
    let availableModelsText = "";
    if (listRes.ok) {
      const listData = await listRes.json();
      const names = (listData.models || []).map((m: any) => m.name || m.model || JSON.stringify(m));
      availableModelsText = names.join(", ");
    } else {
      availableModelsText = `ListModels failed with status ${listRes.status}`;
    }

    throw new Error(
      `No usable Gemini model found for your API key. Tried: ${preferredModels.join(
        ", "
      )}. Available models: ${availableModelsText}. If necessary, enable the model in Google Cloud / AI Studio or use a model name listed above.`
    );
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
