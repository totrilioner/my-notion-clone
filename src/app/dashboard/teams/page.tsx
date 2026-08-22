import { getGuestUser as getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import styles from "./teams.module.css";

import KickButton from "./KickButton";

export default async function TeamsPage() {
  const user = await getUser();
  if (!user) redirect('/auth/login');
  const activeProfile = user.profiles.find((p: any) => p.isActive) || user.profiles[0];
  const isOwner = activeProfile?.jabatan === "Owner";

  // Fetch all active profiles with izinTampilDashboard enabled
  const profiles = await prisma.profile.findMany({
    where: {
      isActive: true,
      izinTampilDashboard: true,
    },
    orderBy: {
      toko: 'asc',
    },
  });

  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <div>
          <p className={styles.eyebrow}>ANGGOTA TIM / RAYCORP</p>
          <h1 className={styles.heading}>Profil publik tim</h1>
          <p className={styles.description}>
            Anggota tim yang telah memberikan izin untuk menampilkan profil mereka.
          </p>
        </div>
      </section>

      <section className={styles.grid}>
        {profiles && profiles.length > 0 ? (
          profiles.map((profile) => (
            <div key={profile.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {profile.namaPanggilan.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.name}>{profile.namaPanggilan}</h3>
                <p className={styles.role}>{profile.jabatan}</p>
                <p className={styles.store}>{profile.toko}</p>
              </div>
              {isOwner && profile.id !== activeProfile.id && (
                <div className={styles.cardFooter}>
                  <KickButton profileId={profile.id} profileName={profile.namaPanggilan} />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.empty}>
            <p>Belum ada anggota tim yang menampilkan profil publik.</p>
          </div>
        )}
      </section>

      <nav className={styles.footer}>
        <Link href="/dashboard">← Kembali ke dashboard</Link>
      </nav>
    </main>
  );
}
