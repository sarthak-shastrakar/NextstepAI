import OpenAI from "openai";

const ai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://nextstep-ai.com", // Optional, for OpenRouter tracking
    "X-Title": "NextStep AI",
  },
});

// Rate limiter: Minimum 1s between calls for OpenRouter stability
let lastCallTime = 0;
const MIN_DELAY = 1000;

async function wait() {
  const now = Date.now();
  const diff = now - lastCallTime;
  if (diff < MIN_DELAY) {
    await new Promise((resolve) => setTimeout(resolve, MIN_DELAY - diff));
  }
  lastCallTime = Date.now();
}

/**
 * Unified AI Service Layer (OpenRouter Migration)
 */
export async function runAI(task, data, options = {}) {
  const { 
    maxTokens = 500, 
    retryCount = 2, 
    isText = false,
    model = "qwen/qwen-2.5-72b-instruct" // Fast and very smart model on OpenRouter
  } = options;

  let attempt = 0;

  while (attempt < retryCount) {
    try {
      await wait();

      const jsonInstruction = isText
        ? "Rules: concise, plain text only, no JSON."
        : "Output: JSON. Rules: respond ONLY with valid JSON, no markdown, no explanation.";

      const prompt = `Input: ${data}\nTask: ${task}\n${jsonInstruction}`;

      const response = await ai.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.6,
        response_format: isText ? undefined : { type: "json_object" }
      });

      let text = response.choices[0].message.content.trim();

      if (isText) return text;

      // Clean markdown if model ignored json_object instruction
      text = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      return JSON.parse(text);
    } catch (error) {
      attempt++;
      console.error(`AI Call Attempt ${attempt} failed:`, error.message);

      if (attempt >= retryCount) {
        throw new Error("AI service currently unavailable. Triggering fallback...");
      }
      
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}
