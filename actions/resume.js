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

export async function saveResume(content) {
  const user = await checkUser();

  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content,
      },
      create: {
        userId: user.id,
        content,
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

  return await db.resume.findUnique({
    where: {
      userId: user.id,
    },
  });
}

export async function improveWithAI({ current, type }) {
  const user = await checkUser();

  if (!user) throw new Error("User not found");

  const prompt = `Input: Type:${type}, Industry:${user.industry}, Text:"${current}". Task: Improve for resume. Rules: Action verbs, Measurable results, Concise (1 para), Industry keywords, 0 preamble.`;

  try {
    const result = await client.chat.completions.create({
      model: "google/gemma-2-9b-it:free",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    console.log(result.usage)
    const improvedContent = result.choices[0].message.content.trim();
    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}

export async function getATSScore(resumeContent) {
  const user = await checkUser();

  if (!user) throw new Error("User not found");

  const prompt = `Input: Industry:${user.industry}, Resume:"${resumeContent}". Task: ATS Evaluation. Output: JSON {score(0-100), summary, strengths:[], weaknesses:[], suggestions:[], missingKeywords:[]}. Rules: Critical, JSON ONLY.`;

  try {
    const result = await client.chat.completions.create({
      model: "google/gemma-2-9b-it:free",
      messages: [
        { role: "system", content: "Expert ATS analyzer. Strict JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });


    const analysis = JSON.parse(result.choices[0].message.content);
    return analysis;
  } catch (error) {
    console.error("Error getting ATS score:", error);
    throw new Error("Failed to analyze resume. Please try again.");
  }
}

export async function generateSummary({ skills, experience }) {
  const user = await checkUser();

  if (!user) throw new Error("User not found");

  const prompt = `Input: Industry:${user.industry}, Skills:${skills}, Exp:${JSON.stringify(experience)}. Task: Write 3-4 sentence resume summary. Rules: Measurable impact, No preamble, ONLY text.`;

  try {
    const result = await client.chat.completions.create({
      model: "google/gemma-2-9b-it:free",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });


    const summary = result.choices[0].message.content.trim();
    return summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary. Please try again.");
  }
}
