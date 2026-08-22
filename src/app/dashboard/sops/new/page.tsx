import { getGuestUser as getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SopEditor from "../SopEditor";
import { STORES } from "@/lib/constants";
import styles from "../sops.module.css";

export default async function NewSopPage({ searchParams }: { searchParams: Promise<{ store?: string }> }) {
  const user = await getUser();
  const profile = user.profiles.find((p: any) => p.isActive) || user.profiles[0];

  if (!profile || !["Owner", "Admin Office", "Supervisor"].includes(profile.jabatan)) {
    redirect("/dashboard");
  }

  const { store } = await searchParams;

  // If a store is selected and it's valid, show the editor
  if (store && STORES.includes(store as any)) {
    return <SopEditor store={store as any} />;
  }

  // Otherwise, show store selector
  return (
    <main className={styles.shell}>
      <div className={styles.editorHeader}>
        <Link className={styles.breadcrumbLink} href="/dashboard">
          ← Dashboard
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>Pilih Toko untuk SOP Baru</span>
      </div>
      
      <div style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "8px" }}>Pilih Toko</h1>
        <p style={{ color: "var(--text-faint, #666)", marginBottom: "32px" }}>
          SOP ini akan diterbitkan khusus untuk toko yang Anda pilih di bawah ini.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px"
        }}>
          {STORES.map((s) => (
            <Link 
              key={s} 
              href={`/dashboard/sops/new?store=${encodeURIComponent(s)}`}
              className={styles.storeCard}
            >
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 500 }}>{s}</h3>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
