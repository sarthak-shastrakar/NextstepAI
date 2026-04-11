"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { runAI } from "@/lib/ai-service";
import { mockInterviews, industryMap } from "@/data/mock-interviews";

/**
 * Gets high-quality mock data based on industry and request type
 */
function getMockData(industryId, type = "technical", count = 5) {
  const category = industryMap[industryId] || "behavioral";
  const source = type === "behavioral" ? mockInterviews.behavioral : (mockInterviews[category] || mockInterviews.tech);
  
  // Shuffle and slice to respect the user's chosen count
  const shuffled = [...source].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  
  return selected;
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
      
      try {
        return await runAI(prompt, "Evaluate Interview Answers", { maxTokens: 600 });
      } catch (error) {
        console.error("AI Evaluation failed, using generic feedback:", error);
        return {
          scores: { situation: 4, task: 4, action: 4, result: 3 },
          overallScore: 75,
          feedback: "Good response. Try to add more specific metrics to your results to make them more impactful.",
          analysis: { situation: "Clear", task: "Defined", action: "Active", result: "Presented" }
        };
      }
    } else {
      // ── Question Generation Mode ──
      const isBehavioral = type === "behavioral";
      const prompt = isBehavioral
        ? `Input: Industry:${user.industry}. Task: Generate 5 behavioral questions for STAR method based on Startup/Mid-level company culture. Output: JSON {questions:[{question,category,description}]}. Rules: JSON ONLY, concise.`
        : `Input: TechStack:${options.techStack || user.skills}, Lv:${options.difficulty || "mid"}, Count:${options.count || 5}. Task: Generate technical MCQs. Output: JSON {questions:[{question,options,correctAnswer,explanation}]}. Rules: JSON ONLY, explanations < 10 words, valid JSON.`;

      try {
        const result = await runAI(prompt, "Generate Interview Questions", { maxTokens: 1000 });
        return result.questions || result;
      } catch (error) {
        console.warn("AI Generation failed, switching to Mock Fallback:", error.message);
        
        // Use user's industry and count for fallback
        // Mapping industry name to ID if needed (industries.js id is usually lowercased name)
        const industryId = user.industry?.toLowerCase() || "tech";
        return getMockData(industryId, type, options.count || 5);
      }
    }
  } catch (error) {
    console.error("Critical Interview Error:", error);
    throw new Error(`Interview system error: ${error?.message || "Internal error"}`);
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
        improvementTip = await runAI(prompt, "Generate Improvement Tip", { maxTokens: 150, isText: true });
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
