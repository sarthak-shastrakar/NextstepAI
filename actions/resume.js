"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import { checkUser } from "@/lib/checkUser";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

import { runAI } from "@/lib/ai-service";

export async function saveResume(content) {
  const user = await checkUser();

  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content: content || "",
      },
      create: {
        userId: user.id,
        content: content || "",
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const user = await checkUser();

  if (!user) return null;

  const resume = await db.resume.findUnique({
    where: {
      userId: user.id,
    },
  });

  return { resume, user };
}

export async function improveWithAI({ current, type }) {
  const user = await checkUser();

  if (!user) throw new Error("User not found");

  const task = `Improve ${type} for resume using action verbs, measurable results, and industry keywords. Be concise (1 paragraph).`;
  const data = `Industry: ${user.industry}, Current Text: "${current}"`;

  try {
    const response = await runAI(task, data, { maxTokens: 250, isText: true });
    return response;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}

export async function getATSScore(resumeContent) {
  const user = await checkUser();

  if (!user) throw new Error("User not found");

  const task = "Evaluate resume for ATS.";
  const data = `Industry: ${user.industry}, Resume: "${resumeContent}"`;

  // Check if we should consolidated it, but for now just optimize
  try {
    const analysis = await runAI(task, data, {
      maxTokens: 500,
    });
    return analysis;
  } catch (error) {
    console.error("Error getting ATS score:", error);
    throw new Error("Failed to analyze resume. Please try again.");
  }
}

export async function generateSummary({ skills, experience }) {
  const user = await checkUser();

  if (!user) throw new Error("User not found");

  const task = "Write a 3-4 sentence professional resume summary with measurable impact. No preamble, only the summary text.";
  const data = `Industry: ${user.industry}, Skills: ${skills}, Experience: ${JSON.stringify(experience)}`;

  try {
    const response = await runAI(task, data, { maxTokens: 300, isText: true });
    return response;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary. Please try again.");
  }
}

/**
 * Consolidated Resume Analysis: ONE call for all resume metadata
 */
export async function analyzeResume(resumeContent) {
  const user = await checkUser();
  if (!user) throw new Error("User not found");

  const task = `Perform comprehensive resume analysis. Return: improvedResume, summary, score (0-100), and improvementTips (array).`;
  const data = `Industry: ${user.industry}, ResumeContent: "${resumeContent}"`;

  try {
    const response = await runAI(task, data, {
      maxTokens: 800,
    });
    
    return {
      improvedResume: response.improvedResume || "",
      summary: response.summary || "",
      score: response.score || 0,
      tips: response.improvementTips || response.tips || [],
    };
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error("Failed to perform comprehensive resume analysis.");
  }
}
