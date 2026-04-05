"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
// import { db } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";
import { runAI } from "@/lib/ai-service";

export async function GenerateCoverLetter(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const task = `Write a professional cover letter for ${data.jobTitle} at ${data.companyName}.`;
  const inputData = `Industry: ${user.industry}, Experience: ${user.experience}yrs, Skills: ${user.skills.join(", ")}, Bio: ${user.bio}, Job Description: ${data.jobDescription}`;

  try {
    const response = await runAI(task, inputData, {
      maxTokens: 500,
    });

    const content = typeof response === 'string' ? response : (response.coverLetter || response.content || JSON.stringify(response));


    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    return coverLetter;
  } catch (error) {
    console.error("Error generating cover letter:", error.message);
    throw new Error("Failed to generate cover letter" + error.message);
  }
}
export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.delete({
    where: {
      id,
      userId: user.id,
    },
  });
}