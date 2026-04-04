import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return null;
    }


    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return null;
    }

    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // Check if user exists by email if not found by clerkUserId
    const userByEmail = await db.user.findUnique({
      where: {
        email: email,
      },
    });

    if (userByEmail) {
      return await db.user.update({
        where: { id: userByEmail.id },
        data: { clerkUserId: user.id },
      });
    }

    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: email,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Critical error in checkUser:", error);
    return null;
  }
};