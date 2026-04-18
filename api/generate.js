import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Initialize Gemini
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const { prompt, extra } = req.body;

  // 2. The Master Prompt
  const fullPrompt = `
    You are a game engine for 'Impostor', a social deduction party game.
    Generate a secret word for the category: ${prompt}.
    
    Rules:
    - word: A concrete, specific, well-known noun. ALL CAPS.
    ${extra}
    - category: A short display name (e.g. "Food & Drink"). Title Case.
    
    Return ONLY valid JSON in this format:
    {"word": "...", "category": "...", "hint": "...", "faultyWord": "..."}
  `;

  try {
    const result = await model.generateContent(fullPrompt);
    const data = JSON.parse(result.response.text());
    res.status(200).json(data);
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to generate mission data" });
  }
}