import { getGuestUser as getUser } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { canAccessObsidian, canEditStore, type Role } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { videoEmbedUrl } from "@/lib/sop";
import SopInteractions from "./SopInteractions";
import ObsidianPanel from "./ObsidianPanel";
import styles from "../sops.module.css";



export default async function SopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  const profile = user.profiles.find((p: any) => p.isActive) || user.profiles[0];
  
  const sop = await prisma.sop.findUnique({
    where: { id }
  });

  if (!sop) notFound();
  
  const canEdit = profile ? canEditStore(profile.jabatan as Role, sop.toko as any, profile.toko as any) : false;
  const canUseObsidian = profile ? canAccessObsidian(profile.jabatan as Role) && profile.toko === sop.toko : false;
  
  return <main className={styles.shell}>
    <div className={styles.editorHeader}>
      <Link href="/dashboard">← Dashboard</Link>
      <span>{sop.toko}</span>
      {canEdit && <Link className={styles.store} href={`/dashboard/sops/${sop.id}/edit`}>Edit SOP</Link>}
    </div>

    <article className={`${styles.preview} ${styles.document}`}>
      <div className={styles.documentHeader}>
        <div>
          <span className={styles.documentEyebrow}>STANDARD OPERATING PROCEDURE</span>
          <h1>{sop.judul}</h1>
        </div>
        <div className={styles.documentTag}>{sop.toko}</div>
      </div>

      <div className={styles.metaRow}>
        <span className={styles.metaBadge}>Diperbarui {sop.updatedAt.toLocaleString("id-ID")}</span>
        <span className={styles.metaBadge}>{sop.toko}</span>
        <span className={styles.metaBadge}>{profile?.jabatan || "Tim"}</span>
      </div>
      <div dangerouslySetInnerHTML={{ __html: sop.contentClean || "" }} />

      {videoEmbedUrl(sop.videoUrl || "") && (
        <div className={styles.video}>
          <iframe src={videoEmbedUrl(sop.videoUrl || "") || undefined} title={`Video panduan ${sop.judul}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      )}
    </article>

    {canUseObsidian && <ObsidianPanel sopId={sop.id} title={sop.judul} store={sop.toko} />}

    <SopInteractions sopId={sop.id} />
  </main>;
}
