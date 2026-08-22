"use server";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { getGuestUser as getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function kickTeamMember(profileId: string) {
  const user = await getUser();
  if (!user) redirect('/auth/login');
  const activeProfile = user.profiles.find((p: any) => p.isActive) || user.profiles[0];
  
  if (activeProfile?.jabatan !== "Owner") {
    throw new Error("Hanya Owner yang dapat mengeluarkan anggota tim.");
  }

  // Prevent kicking the owner themselves
  if (profileId === activeProfile.id) {
    throw new Error("Anda tidak dapat mengeluarkan diri sendiri.");
  }

  await prisma.profile.delete({
    where: { id: profileId },
  });

  revalidatePath("/dashboard/teams");
}
