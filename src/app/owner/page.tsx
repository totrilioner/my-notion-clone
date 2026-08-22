import { getGuestUser as getUser } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import OwnerChart from "./OwnerChart";
import styles from "./owner.module.css";



export default async function OwnerPage() {
  const user = await getUser();
  const profile = user.profiles.find((p: any) => p.isActive) || user.profiles[0];
  
  if (profile?.jabatan !== "Owner") redirect("/dashboard");
  
  const logs = await prisma.readingLog.findMany({
    select: { mulai: true, durasi: true },
    orderBy: { mulai: 'desc' },
    take: 300
  });

  const days = new Map<string, { dibuka: number; durasiTotal: number; durasiCount: number }>();
  logs.forEach((log) => { 
    const hari = new Date(log.mulai).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }); 
    const current = days.get(hari) || { dibuka: 0, durasiTotal: 0, durasiCount: 0 }; 
    current.dibuka += 1; 
    if (log.durasi !== null) { 
      current.durasiTotal += log.durasi; 
      current.durasiCount += 1; 
    } 
    days.set(hari, current); 
  });
  
  const chartData = [...days.entries()].slice(0, 7).reverse().map(([hari, value]) => ({ 
    hari, 
    dibuka: value.dibuka, 
    durasi: value.durasiCount ? Math.round(value.durasiTotal / value.durasiCount) : 0 
  }));
  
  const totalReads = logs.length;
  const average = logs.filter((log) => log.durasi !== null).reduce((sum, log) => sum + (log.durasi || 0), 0) / Math.max(1, logs.filter((log) => log.durasi !== null).length);
  
  return <main className={styles.shell}><header className={styles.header}><Link href="/dashboard">← Kembali ke workspace</Link><span>Owner dashboard · {profile.namaPanggilan}</span></header><section className={styles.main}><p className={styles.eyebrow}>PEMANTAUAN PEMILIK</p><h1 className={styles.heading}>Ritme tim, terlihat jelas.</h1><p className={styles.intro}>Data pembacaan SOP membantu melihat kebiasaan belajar tanpa mengganggu pekerjaan.</p><div className={styles.stats}><div className={styles.stat}><strong>{totalReads}</strong><span>Sesi baca tercatat</span></div><div className={styles.stat}><strong>{Math.round(average)}s</strong><span>Durasi baca rata-rata</span></div><div className={styles.stat}><strong>{chartData.length}</strong><span>Hari aktif terakhir</span></div></div><div className={styles.chart}><h2 className={styles.chartTitle}>SOP dibuka per hari</h2><OwnerChart data={chartData} /></div></section></main>;
}
