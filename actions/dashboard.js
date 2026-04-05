"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { runAI } from "@/lib/ai-service";

export const generateAIInsights = async (industry) => {
  const task = `Analyze current industry state for ${industry}.`;
  const data = `Industry: ${industry}`;

  try {
    const insights = await runAI(task, data, {
      maxTokens: 400,
    });
    
    return insights;

  } catch (error) {
    console.error("AI Insight Generation Error:", error);
    // Return a structured fallback to prevent dashboard crashes
    return {
      salaryRanges: [],
      growthRate: 0,
      demandLevel: "MEDIUM",
      topSkills: [],
      marketOutlook: "NEUTRAL",
      keyTrends: [],
      recommendedSkills: []
    };
  }
};

export async function getIndustryInsights(forceRefresh = false) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist OR a refresh is forced, generate/regenerate them
  if (!user.industryInsight || forceRefresh) {
    const insights = await generateAIInsights(user.industry);

    if (user.industryInsight) {
      // Update existing
      const updatedInsight = await db.industryInsight.update({
        where: { id: user.industryInsight.id },
        data: {
          ...insights,
          lastUpdated: new Date(),
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      return { ...updatedInsight, userSkills: user.skills };
    } else {
      // Create new
      const industryInsight = await db.industryInsight.create({
        data: {
          industry: user.industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      return { ...industryInsight, userSkills: user.skills };
    }
  }

  return { ...user.industryInsight, userSkills: user.skills };
}
