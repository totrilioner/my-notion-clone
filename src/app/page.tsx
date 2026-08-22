import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.landing}>
      {/* Navbar */}
      <nav className={styles.nav} aria-label="Navigasi utama">
        <Link className={styles.brand} href="/" aria-label="RayCorp beranda">
          <Image src="/logo/raycorp-logo.svg" alt="RayCorp" width={32} height={32} priority />
          <span className={styles.brandName}>RayCorp</span>
        </Link>
        <div className={styles.navRight}>
          <Link className={styles.navLink} href="/dashboard">Dashboard</Link>
          <Link className={styles.navLink} href="/notion-clone">Notion</Link>
          <Link className={styles.navLink} href="/owner">Owner</Link>
          <Link className={styles.navLink} href="/auth/login">Masuk</Link>
          <Link className={styles.navCta} href="/auth/register">Mulai gratis</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Workspace Aktif
          </div>
          <h1 className={styles.heroTitle}>
            Kerja dengan<br /><em>lebih baik.</em>
          </h1>
          <p className={styles.heroLede}>
            Satu ruang untuk SOP, pembelajaran, dan kolaborasi tim. Ringan seperti catatan, kuat seperti sistem.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.btnPrimary} href="/auth/register">
              Mulai sekarang →
            </Link>
            <Link className={styles.btnSecondary} href="/auth/login">
              Sudah punya akun
            </Link>
          </div>
        </div>

        {/* Mockup Panel */}
        <div className={styles.heroPanel} aria-label="Preview workspace">
          <div className={styles.panelTopbar}>
            <span className={styles.panelDot} />
            <span className={styles.panelDot} />
            <span className={styles.panelDot} />
            <span className={styles.panelTitle}>RayCorp Workspace</span>
          </div>
          <div className={styles.panelBody}>
            <div className={`${styles.panelPage} ${styles.panelPageActive}`}>
              <span className={styles.panelIcon}>📋</span>
              SOP Kasir
              <span className={styles.panelLive}>
                <span className={styles.livePulse} />
                live
              </span>
            </div>
            <div className={styles.panelPage}>
              <span className={styles.panelIcon}>📚</span>
              Panduan Stok
            </div>
            <div className={styles.panelPage}>
              <span className={styles.panelIcon}>💬</span>
              Chat Tim
            </div>

            <div className={styles.panelDivider} />

            <div className={styles.panelStats}>
              <div className={styles.panelStat}>
                <strong>128</strong>
                <span>SOP</span>
              </div>
              <div className={styles.panelStat}>
                <strong>07</strong>
                <span>Toko</span>
              </div>
              <div className={styles.panelStat}>
                <strong>24</strong>
                <span>Anggota</span>
              </div>
            </div>

            <div className={styles.panelActivity}>
              <div className={styles.panelAvatar}>AN</div>
              <div className={styles.panelActivityText}>
                <b>Andi</b> memperbarui SOP kasir
              </div>
              <span className={styles.panelTime}>2m</span>
            </div>
            <div className={styles.panelActivity}>
              <div className={styles.panelAvatar} style={{ background: "#e9e9e7", color: "#8b0000" }}>SR</div>
              <div className={styles.panelActivityText}>
                <b>Sari</b> menyelesaikan kuis
              </div>
              <span className={styles.panelTime}>18m</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresInner}>
          <p className={styles.featuresLabel}>Fitur utama</p>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <p className={styles.featureNum}>01</p>
              <h3>Satu standar kerja</h3>
              <p>Semua orang tahu cara terbaik mengerjakan sesuatu dengan SOP yang jelas dan terstruktur.</p>
            </div>
            <div className={styles.featureCard}>
              <p className={styles.featureNum}>02</p>
              <h3>Terus belajar</h3>
              <p>Kuis berbasis konten dan saran nyata menjadi kebiasaan belajar yang berkelanjutan.</p>
            </div>
            <div className={styles.featureCard}>
              <p className={styles.featureNum}>03</p>
              <h3>Chat tim real-time</h3>
              <p>Komunikasi antar anggota toko langsung di workspace, tanpa perlu pindah aplikasi.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
