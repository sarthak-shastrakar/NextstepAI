import { GoogleGenAI } from "@google/genai";

// Use newer SDK with gemini-2.0-flash — has global routing, avoids regional 0-quota issue
const ai = new GoogleGenAI({ apiKey: process.env.GENERATIVE_AI_KEY });

// Rate limiter: Minimum 2s between calls to prevent 429 on free tier
let lastCallTime = 0;
const MIN_DELAY = 2000;

async function wait() {
  const now = Date.now();
  const diff = now - lastCallTime;
  if (diff < MIN_DELAY) {
    await new Promise((resolve) => setTimeout(resolve, MIN_DELAY - diff));
  }
  lastCallTime = Date.now();
}

/**
 * Unified AI Service Layer
 * @param {string} task   - Instruction for the AI
 * @param {string} data   - Input data
 * @param {object} options - { maxTokens, isText }
 *   isText: true  → returns plain string (for cover letters, tips, summaries)
 *   isText: false → parses & returns JSON (default)
 */
export async function runAI(task, data, options = {}) {
  const { maxTokens = 500, retryCount = 3, backoff = 3000, isText = false } = options;

  let attempt = 0;

  while (attempt < retryCount) {
    try {
      await wait();

      const jsonInstruction = isText
        ? "Rules: concise, plain text only, no JSON."
        : "Output: JSON\nRules: respond ONLY with a valid JSON object, no markdown, no explanation.";

      const prompt = `Input: ${data}\nTask: ${task}\n${jsonInstruction}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        },
      });

      let text = response.text.trim();

      if (isText) {
        return text;
      }

      // Aggressively strip any markdown code fences before parsing
      text = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      try {
        return JSON.parse(text);
      } catch (parseError) {
        // If it's not valid JSON after cleaning, extract JSON from text
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          return JSON.parse(match[0]);
        }
        console.error("Failed to parse AI response as JSON:", text.slice(0, 300));
        throw new Error("Invalid AI response format");
      }
    } catch (error) {
      attempt++;
      console.error(`AI Call Attempt ${attempt} failed:`, error.message);

      const is429 = error.message.includes("429") || error.message.includes("quota") || error.message.includes("RATE_LIMIT");
      const is5xx = error.message.includes("500") || error.message.includes("503");

      if ((is429 || is5xx) && attempt < retryCount) {
        const waitTime = backoff * Math.pow(2, attempt - 1); // 3s → 6s → 12s
        console.log(`Retrying in ${waitTime / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (attempt >= retryCount) {
        console.error("All AI retry attempts exhausted.");
        throw new Error("AI service currently unavailable. Please try again in a moment.");
      }
    }
  }
}
