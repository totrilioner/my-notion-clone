import { getGuestUser as getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DashboardShell from "./DashboardShell";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect('/auth/login');
  const activeProfile = user.profiles.find((p: any) => p.isActive) || user.profiles[0];

  const PAGE_SIZE = 20;
  
  let totalCount = 0;
  let sops: any[] = [];
  
  try {
    totalCount = await prisma.sop.count({
      where: activeProfile.jabatan === "Owner" ? undefined : { toko: activeProfile.toko }
    });

    sops = await prisma.sop.findMany({
      where: activeProfile.jabatan === "Owner" ? undefined : { toko: activeProfile.toko },
      select: {
        id: true,
        judul: true,
        toko: true,
        updatedAt: true,
        creatorId: true,
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: PAGE_SIZE
    });
  } catch (err) {
    console.log("Database belum siap, menggunakan data kosong untuk sementara.");
  }

  return (
    <DashboardShell 
      initialProfile={activeProfile as any} 
      profiles={user.profiles as any[]} 
      initialSops={sops as any[]} 
      totalCount={totalCount} 
    />
  );
}
