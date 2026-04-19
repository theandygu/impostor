const { GoogleGenAI } = require("@google/genai");

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, extra } = req.body;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const fullPrompt = `
    You are a game engine for 'Impostor', a social deduction party game.
    Generate a secret word for the category: ${prompt}.
    Rules:
    - word: A concrete, specific, well-known noun. ALL CAPS.
    ${extra}
    - category: A short display name (e.g. "Food & Drink"). Title Case.
    Return ONLY valid JSON, no markdown, no backticks:
    {"word": "...", "category": "...", "hint": null, "faultyWord": null}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: fullPrompt,
    });
    const raw = response.text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(raw);
    res.status(200).json(data);
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to generate" });
  }
};