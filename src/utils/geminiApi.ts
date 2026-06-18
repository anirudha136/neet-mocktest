import axios from "axios";

export type Question = {
  question: string;
  options: string[];
  answer: number;
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY as string | undefined;

export const generateQuestions = async (
  chapter: string,
  concepts: string[],
  difficulty: "easy" | "medium" | "hard"
): Promise<Question[]> => {
  if (!GEMINI_API_KEY) {
    console.error("[Gemini] Missing VITE_GEMINI_KEY env var.");
    return [];
  }

  const prompt = `You are generating NEET Biology MCQs.
Return ONLY a valid JSON array (no prose, no code fences, no backticks).
Each item must have: question (string), options (array of 4 strings), answer (number index 0-3).

Make ${Math.min(concepts.length * 2 + 5, 25)} questions.
Chapter: ${chapter}
Concepts: ${concepts.join(", ")}
Difficulty: ${difficulty}`;

  try {
    console.debug("[Gemini] Requesting questions", { chapter, conceptsCount: concepts.length, difficulty });
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      },
      { headers: { "Content-Type": "application/json" } }
    );
    console.debug("[Gemini] Response status", response.status);

    const parts = response?.data?.candidates?.[0]?.content?.parts;
    const raw = Array.isArray(parts)
      ? parts.map((p: any) => p?.text || "").join("\n")
      : "";

    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    console.debug("[Gemini] Raw length / cleaned length", raw.length, cleaned.length);

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (!match) {
        console.error("[Gemini] No JSON array found in model output");
        return [];
      }
      parsed = JSON.parse(match[0]);
    }

    if (!Array.isArray(parsed)) {
      console.error("[Gemini] Parsed content is not an array");
      return [];
    }

    const normalized: Question[] = parsed
      .map((it: any) => ({
        question: String(it?.question ?? ""),
        options: Array.isArray(it?.options) ? it.options.map((o: any) => String(o)) : [],
        answer: Number.isInteger(it?.answer) ? Number(it.answer) : -1,
      }))
      .filter((q: Question) => q.question && q.options.length === 4 && q.answer >= 0 && q.answer < 4);

    console.info("[Gemini] Generated questions", { count: normalized.length });
    return normalized;
  } catch (err) {
    console.error("[Gemini] API error", err);
    return [];
  }
};
