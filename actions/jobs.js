"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { jobsData } from "@/data/jobs";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const FREE_MODELS = [
  "qwen/qwen3.6-plus:free",
  "openai/gpt-oss-20b:free",
  "google/gemma-3-4b-it:free",
];

async function callWithFallback(messages, options = {}) {
  let lastError = null;
  for (const model of FREE_MODELS) {
    try {
      const result = await openai.chat.completions.create({
        model,
        messages,
        ...options,
      });
      return result;
    } catch (error) {
      if (error?.message?.includes("429") || error?.message?.includes("rate")) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function getRecommendedJobs() {
  const { userId } = await auth();
  if (!userId) return { success: false, recommendedIds: [] };

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true, skills: true, experience: true },
  });

  if (!user || !user.industry) return { recommendedIds: [] };

  const jobOptions = jobsData.map(j => ({ id: j.id, title: j.title }));
  const prompt = `Analyze user: {industry: "${user.industry}", skills: ${JSON.stringify(user.skills)}}. Pick top 3-5 JOB IDs from this list: ${JSON.stringify(jobOptions)}. Output: JSON {recommendedIds: ["id1", ...]}. Rules: JSON ONLY, concise.`;

  try {
    const result = await callWithFallback([{ role: "user", content: prompt }], { response_format: { type: "json_object" }, max_tokens: 200 });
    const response = JSON.parse(result.choices[0].message.content);
    return { success: true, recommendedIds: response.recommendedIds || [] };
  } catch (error) {
    return { success: false, recommendedIds: [] };
  }
}

/**
 * Discovery Engine: Generates 5 high-quality niche roles dynamically
 */
export async function getNicheRoles(industry, subIndustry) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const niche = subIndustry || industry;
  const prompt = `Task: Generate 5 brief roles for "${niche}". 
  Output: JSON {roles: [{id, title, category, description, responsibilities, skills, tools}]}. 
  Rules: 
  - Descriptions < 15 words. 
  - 2 bullet responsibilities.
  - minified JSON. 
  - category MUST be "${niche}".`;

  try {
    const result = await callWithFallback([{ role: "user", content: prompt }], { 
        response_format: { type: "json_object" }, 
        max_tokens: 500 
    });
    
    const response = JSON.parse(result.choices[0].message.content);
    return {
      success: true,
      roles: response.roles || []
    };
  } catch (error) {
    console.error("Discovery error:", error);
    return { success: false, roles: [] };
  }
}
