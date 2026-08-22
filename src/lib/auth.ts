import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function getGuestUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      profiles: true
    }
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
