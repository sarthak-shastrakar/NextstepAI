"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addReview(rating, content) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) throw new Error("User not found");

  try {
    const review = await db.review.create({
      data: {
        rating,
        content,
        userId: user.id,
      },
    });

    revalidatePath("/");
    return review;
  } catch (error) {
    console.error("Error adding review:", error);
    throw new Error(`Failed to add review: ${error.message}`);
  }
}

export async function getReviews() {
  try {
    const reviews = await db.review.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            clerkUserId: true,
            name: true,
            imageUrl: true,
            industry: true,
          },
        },
      },
      take: 20,
    });

    return reviews;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }
}

export async function deleteReview(id) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) throw new Error("User not found");

  try {
    const review = await db.review.findUnique({
      where: { id },
    });

    if (!review) throw new Error("Review not found");
    if (review.userId !== user.id) throw new Error("Unauthorized to delete this review");

    await db.review.delete({
      where: { id },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    throw new Error(`Failed to delete review: ${error.message}`);
  }
}
