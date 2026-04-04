"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});


export async function generateQuestions(type = "technical", options = {}) {
  const { techStack, difficulty, count = 10 } = options;

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const isBehavioral = type === "behavioral";

  const prompt = isBehavioral
    ? `Input: Industry:${user.industry}. Task: Generate 5 behavioral questions for STAR method answers. Focus: Leadership, Conflict, Teamwork, Problem Solving. Output: JSON {questions:[{question, category, description}]}.`
    : `Input: TechStack:${techStack || user.skills}, Lv:${difficulty}, Count:${count}. Task: Generate technical MCQs. Output: JSON {questions:[{question, options, correctAnswer, explanation}]}. Rules: JSON ONLY, No preamble.`;

  try {
    const result = await openai.chat.completions.create({
      model: "google/gemma-2-9b-it:free",
      messages: [{ role: "user", content: prompt + " Keep explanations under 1 sentence." }],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });
    const data = JSON.parse(result.choices[0].message.content);
    return data.questions;

  } catch (error) {
    console.error(`Error generating ${type} questions:`, error.message);
    throw new Error(`Failed to generate ${type} questions`);
  }
}

// Keep generateQuiz for backward compatibility, but it calls generateQuestions
export async function generateQuiz() {
  return await generateQuestions("technical");
}

export async function evaluateSTARResponse(question, answer) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `Input: Question:${question}, Answer:${answer}. Task: Evaluate using STAR method (0-5 per category, 0-100 overall). Output: JSON {scores:{situation, task, action, result}, overallScore, feedback, analysis:{situation, task, action, result}}. Rules: Accurate, Critical, JSON ONLY.`;

  try {
    const result = await openai.chat.completions.create({
      model: "google/gemma-2-9b-it:free",
      messages: [{ role: "user", content: prompt + " Keep feedback < 2 sentences." }],
      response_format: { type: "json_object" },
      max_tokens: 350,
    });
    return JSON.parse(result.choices[0].message.content);



  } catch (error) {
    console.error("Error evaluating STAR response:", error.message);
    throw new Error("Failed to evaluate your response. Please try again.");
  }
}

export async function saveQuizResult(questions, answers, score, category = "Technical") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

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
      // Behaviorial/STAR results
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
        .map(
          (q) =>
            `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
        )
        .join("\n\n");

      const improvementPrompt = `Input: WrongAnswers:${wrongQuestionsText}. Industry:${user.industry}. Task: Provide concise improvement tip. Rules: < 2 sentences, encouraging, ONLY text.`;

      try {
        const tipResult = await openai.chat.completions.create({
          model: "google/gemma-2-9b-it:free",
          messages: [{ role: "user", content: improvementPrompt }],
          max_tokens: 150,
        });
        improvementTip = tipResult.choices[0].message.content.trim();
      } catch (error) {


        console.error("Error generating improvement tip:", error);
      }
    }
  } else {
    // For behavioral, the tip comes from the AI analysis of the scores
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
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
