import prisma from "@/lib/prisma";
import { getGuestUser as getUser } from "@/lib/auth";
import CasesClient from "./CasesClient";

export default async function CasesPage() {
  const user = await getUser();
  const isAdmin = user.profiles.some((p: any) => p.jabatan === "Owner" || p.jabatan === "Admin");

  let cases: any[] = [];
  let assignees: any[] = [];

  try {
    cases = await prisma.complaintCase.findMany({
      where: isAdmin ? undefined : { assignedToUserId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    if (isAdmin) {
      assignees = await prisma.user.findMany({
        select: { id: true, name: true, email: true }
      });
    }
  } catch (err) {
    console.error("Database table may not exist yet", err);
  }

  return <CasesClient cases={cases} assignees={assignees} isAdmin={isAdmin} currentUserId={user.id} />;
}
