"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

// OpenRouter client — using free Gemini model (no quota issue)
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// Fallback chain — tested & working free models (priority order)
const FREE_MODELS = [
  "qwen/qwen3.6-plus:free",           // ✅ Fast and reliable
  "openai/gpt-oss-20b:free",         // From free_models.txt
  "google/gemma-3-4b-it:free",       // ✅ Confirmed working
  "google/gemma-3-12b-it:free",      // fallback
  "google/gemma-3-27b-it:free",      // fallback
];

async function callWithFallback(messages, options = {}) {
  let lastError = null;
  for (const model of FREE_MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      const result = await openai.chat.completions.create({
        model,
        messages,
        ...options,
      });
      return result;
    } catch (error) {
      console.warn(`Model ${model} failed: ${error?.message}`);
      lastError = error;
      // Only continue to next model on rate-limit errors
      if (!error?.message?.includes("429") && !error?.message?.includes("rate") && !error?.message?.includes("429")) {
        throw error;
      }
    }
  }
  throw lastError;
}

/**
 * Smart Interview: Generates questions OR evaluates answers in ONE call
 */
export async function smartInterview({ type = "technical", options = {}, answers = null }) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true, skills: true },
  });

  if (!user) throw new Error("User not found");

  try {
    if (answers) {
      // ── Evaluation Mode ──
      const prompt = `Input: Q&A:${JSON.stringify(answers)}, Industry:${user.industry}. Task: Evaluate using STAR method (0-5 per category, 0-100 overall). Output: JSON {scores:{situation,task,action,result}, overallScore, feedback, analysis:{situation,task,action,result}}. Rules: JSON ONLY, < 2 sentences feedback.`;
      const result = await callWithFallback(
        [{ role: "user", content: prompt }],
        { response_format: { type: "json_object" }, max_tokens: 600 }
      );
      
      const content = result?.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI returned empty response");
      
      return JSON.parse(content);
    } else {
      // ── Question Generation Mode ──
      const isBehavioral = type === "behavioral";
      const prompt = isBehavioral
        ? `Input: Industry:${user.industry}. Task: Generate 5 behavioral questions for STAR method based on Startup/Mid-level company culture (Ownership, Ambiguity, Fast-paced). Output: JSON {questions:[{question,category,description}]}. Rules: JSON ONLY, concise.`
        : `Input: TechStack:${options.techStack || user.skills}, Lv:${options.difficulty || "mid"}, Count:${options.count || 5}. Task: Generate technical MCQs. Output: JSON {questions:[{question,options,correctAnswer,explanation}]}. Rules: JSON ONLY, explanations < 10 words, valid JSON.`;

      const result = await callWithFallback(
        [{ role: "user", content: prompt }],
        { response_format: { type: "json_object" }, max_tokens: 600 }
      );
      
      let content = result?.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI returned empty response");

      // Handle common cut-off issues or formatting
      try {
        return JSON.parse(content).questions || JSON.parse(content);
      } catch (e) {
        // If it's a trailing comma or basic cut-off, try a simple fix
        if (content.endsWith(",") || !content.endsWith("}")) {
            content = content.replace(/,\s*$/, "") + "]}";
            if (!content.includes('"questions":')) content = '{"questions":' + content; 
            try { return JSON.parse(content).questions || JSON.parse(content); } catch(i) {}
        }
        throw e;
      }
    }
  } catch (error) {
    // Log full error details for debugging
    console.error("Interview AI Error — Full Details:");
    console.error("Status:", error?.status);
    console.error("Message:", error?.message);
    const rawResponse = error?.response?.data || error?.error || "";
    console.error("Response Snapshot:", JSON.stringify(rawResponse, null, 2).slice(0, 500));
    throw new Error(`Interview AI failed: ${error?.message || "Unknown error"}`);
  }
}

export async function generateQuestions(type = "technical", options = {}) {
  return await smartInterview({ type, options });
}

export async function generateQuiz() {
  return await generateQuestions("technical");
}

export async function evaluateSTARResponse(question, answer) {
  return await smartInterview({ answers: [{ question, answer }] });
}

export async function saveQuizResult(questions, answers, score, category = "Technical") {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const isTechnical = category === "Technical";

  const questionResults = questions.map((q, index) => {
    if (isTechnical) {
      return {
        question: q.question,
        answer: q.correctAnswer,
        userAnswer: answers[index],
        isCorrect: q.correctAnswer === answers[index],
        explanation: q.explanation,
      };
    } else {
      return {
        question: q.question,
        userAnswer: answers[index].answer,
        evaluation: answers[index].evaluation,
      };
    }
  });

  let improvementTip = null;

  if (isTechnical) {
    const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
    if (wrongAnswers.length > 0) {
      const wrongQuestionsText = wrongAnswers
        .map((q) => `Q: ${q.question}, Correct: ${q.answer}, User: ${q.userAnswer}`)
        .join("\n");

      const prompt = `Input: Wrong:${wrongQuestionsText}, Industry:${user.industry}. Task: Give 1-2 sentence encouraging improvement tip. Rules: plain text only.`;
      try {
        const tipResult = await callWithFallback(
          [{ role: "user", content: prompt }],
          { max_tokens: 150 }
        );
        improvementTip = tipResult.choices[0].message.content.trim();
      } catch (error) {
        console.error("Error generating improvement tip:", error);
      }
    }
  } else {
    improvementTip = "Focus on quantifying your results and clarifying your specific actions using the STAR method.";
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category,
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) return [];

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
