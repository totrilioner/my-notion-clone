import { getGuestUser as getUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SopEditor from "../../SopEditor";



export default async function EditSopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const user = await getUser();
  const profile = user.profiles.find((p: any) => p.isActive) || user.profiles[0];

  const sop = await prisma.sop.findUnique({
    where: { id },
    select: { id: true, judul: true, toko: true, contentHtml: true, videoUrl: true }
  });

  if (!profile || !sop) notFound();

  const allowed = profile.jabatan === "Owner" || (["Admin Office", "Supervisor", "Finance"].includes(profile.jabatan) && profile.toko === sop.toko);
  
  if (!allowed) redirect(`/dashboard/sops/${id}`);

  return <SopEditor store={sop.toko as any} sop={sop as any} />;
}
