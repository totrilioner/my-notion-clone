"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Role, Store } from "@/lib/constants";
import styles from "./dashboard.module.css";

type Profile = { id: string; userId: string; namaPanggilan: string; jabatan: Role; toko: Store; isActive: boolean };
type Sop = { id: string; judul: string; toko: Store; updatedAt: string };
type Toast = { id: string; sopId: string; title: string; store: Store; type: "baru" | "diperbarui" };

const PAGE_SIZE = 20;

// Icons as SVG strings (inline, minimal)
function IconHome() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function IconUsers() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IconChart() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function IconChat() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function IconBook() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
}
function IconClipboard() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
}
function IconFolder() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
}
function IconMenu() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function IconChevronLeft() {
  return <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;
}

export default function DashboardShell({
  initialProfile,
  profiles,
  initialSops,
  totalCount = 0,
  onChatOpen,
}: {
  initialProfile: Profile;
  profiles: Profile[];
  initialSops: Sop[];
  totalCount?: number;
  onChatOpen?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(initialProfile);
  const [items, setItems] = useState(initialSops);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState((totalCount || 0) > PAGE_SIZE);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const canCreate = ["Owner", "Admin Office", "Supervisor"].includes(active.jabatan);
  const latestUpdated = items[0]?.updatedAt
    ? new Date(items[0].updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "Belum ada";

  // Keyboard shortcut: [ to toggle sidebar
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "[" && !["INPUT","TEXTAREA","SELECT"].includes((e.target as HTMLElement).tagName)) {
        setCollapsed(c => !c);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  async function changeStore(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = profiles.find((p) => p.toko === e.target.value);
    if (!next) return;
    setActive(next);
    router.refresh();
  }

  async function logout() {
    router.push("/auth/login");
    router.refresh();
  }

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const initials = active.namaPanggilan.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

  // Dynamically import ChatPanel to keep bundle lean
  const [ChatPanel, setChatPanel] = useState<React.ComponentType<{ store: Store; userName: string; onClose: () => void }> | null>(null);
  useEffect(() => {
    if (chatOpen && !ChatPanel) {
      import("@/components/ChatPanel").then(m => setChatPanel(() => m.default));
    }
  }, [chatOpen, ChatPanel]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className={`${styles.overlay} ${styles.overlayVisible}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <div className={styles.shell}>
        {/* Sidebar */}
        <aside
          className={[
            styles.sidebar,
            collapsed ? styles.sidebarCollapsed : "",
            mobileOpen ? styles.sidebarOpen : "",
          ].filter(Boolean).join(" ")}
          aria-label="Sidebar navigasi"
        >
          {/* Brand */}
          <div className={styles.sidebarBrand}>
            <Link className={styles.brand} href="/" aria-label="RayCorp beranda">
              <Image src="/logo/raycorp-logo.svg" alt="RayCorp" width={28} height={28} priority />
            </Link>
            {!collapsed && (
              <div className={styles.brandTexts}>
                <span className={styles.brandName}>RayCorp</span>
                <span className={styles.brandSub}>Workspace</span>
              </div>
            )}
            <button
              className={styles.collapseBtn}
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? "Buka sidebar ([)" : "Tutup sidebar ([)"}
              aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
            >
              <IconChevronLeft />
            </button>
          </div>

          {/* Nav */}
          <nav className={styles.nav}>
            <div className={styles.navSection}>
              {!collapsed && <span className={styles.navLabel}>Menu</span>}
              <Link
                className={`${styles.navItem} ${pathname === "/dashboard" ? styles.navItemActive : ""}`}
                href="/dashboard"
              >
                <span className={styles.navIcon}><IconHome /></span>
                {!collapsed && <span className={styles.navText}>Beranda</span>}
              </Link>
              <Link
                className={`${styles.navItem} ${pathname?.startsWith("/dashboard/teams") ? styles.navItemActive : ""}`}
                href="/dashboard/teams"
              >
                <span className={styles.navIcon}><IconUsers /></span>
                {!collapsed && <span className={styles.navText}>Tim</span>}
              </Link>
              <Link
                className={`${styles.navItem} ${pathname?.startsWith("/dashboard/knowledge") ? styles.navItemActive : ""}`}
                href="/dashboard/knowledge"
              >
                <span className={styles.navIcon}><IconBook /></span>
                {!collapsed && <span className={styles.navText}>Knowledge Base</span>}
              </Link>
              <Link
                className={`${styles.navItem} ${pathname?.startsWith("/dashboard/intake") ? styles.navItemActive : ""}`}
                href="/dashboard/intake"
              >
                <span className={styles.navIcon}><IconClipboard /></span>
                {!collapsed && <span className={styles.navText}>Intake Komplain</span>}
              </Link>
              <Link
                className={`${styles.navItem} ${pathname?.startsWith("/dashboard/cases") ? styles.navItemActive : ""}`}
                href="/dashboard/cases"
              >
                <span className={styles.navIcon}><IconFolder /></span>
                {!collapsed && <span className={styles.navText}>Operasi Kasus</span>}
              </Link>
              <Link
                className={`${styles.navItem} ${pathname?.startsWith("/owner") ? styles.navItemActive : ""}`}
                href="/owner"
              >
                <span className={styles.navIcon}><IconChart /></span>
                {!collapsed && <span className={styles.navText}>Dashboard Owner</span>}
              </Link>
              <Link
                className={`${styles.navItem} ${pathname?.startsWith("/notion-clone") ? styles.navItemActive : ""}`}
                href="/notion-clone"
              >
                <span className={styles.navIcon}><IconClipboard /></span>
                {!collapsed && <span className={styles.navText}>Notion Workspace</span>}
              </Link>
            </div>

            <div className={styles.navSection}>
              {!collapsed && <span className={styles.navLabel}>Komunikasi</span>}
              <button
                className={`${styles.navItem} ${styles.chatNavBtn} ${chatOpen ? styles.navItemActive : ""}`}
                onClick={() => setChatOpen(o => !o)}
                title="Chat Tim"
              >
                <span className={styles.navIcon}><IconChat /></span>
                {!collapsed && (
                  <>
                    <span className={styles.navText}>Chat Tim</span>
                    <span className={styles.navBadge}>live</span>
                  </>
                )}
              </button>
            </div>

            {/* Store switcher */}
            {profiles.length > 1 && !collapsed && (
              <div className={styles.storeSwitcher}>
                <select className={styles.storeSelect} value={active.toko} onChange={changeStore}>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.toko}>{p.toko}</option>
                  ))}
                </select>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className={styles.sidebarFooter}>
            <div className={styles.userCard}>
              <div className={styles.userAvatar}>{initials}</div>
              {!collapsed && (
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{active.namaPanggilan}</span>
                  <span className={styles.userRole}>{active.jabatan}</span>
                </div>
              )}
            </div>
            {!collapsed && (
              <button className={styles.logoutBtn} onClick={logout}>
                Keluar dari workspace
              </button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className={`${styles.content} ${collapsed ? styles.contentCollapsed : ""}`}>
          {/* Topbar */}
          <header className={styles.topbar}>
            <button
              className={styles.topbarBtn}
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Buka menu"
              style={{ display: "none" }}
              id="mobile-menu-btn"
            >
              <IconMenu />
            </button>
            <div className={styles.topbarBreadcrumb}>
              <span>Beranda</span>
              <span style={{ color: "var(--text-faint)", fontSize: 12 }}>/</span>
              <span>{active.toko}</span>
            </div>
            <div className={styles.topbarActions}>
              {canCreate && (
                <Link className={`${styles.topbarBtn} ${styles.topbarBtnPrimary}`} href="/dashboard/sops/new">
                  + Tambah SOP
                </Link>
              )}
            </div>
          </header>

          {/* Page content */}
          <main className={styles.main}>
            {/* Welcome */}
            <div className={styles.welcomeSection}>
              <p className={styles.welcomeLabel}>{active.toko}</p>
              <h1 className={styles.welcomeHeading}>Halo, {active.namaPanggilan}.</h1>
              <p className={styles.welcomeLede}>
                Temukan SOP tim Anda dan bantu membuatnya semakin selaras, jelas, dan mudah ditingkatkan.
              </p>
            </div>

            {/* Stats bar */}
            <div className={styles.statsBar} role="list">
              <div className={styles.statItem} role="listitem">
                <div className={styles.statLabel}>SOP aktif</div>
                <div className={styles.statValue}>{items.length}{hasMore ? "+" : ""}</div>
                <div className={styles.statSub}>{active.toko}</div>
              </div>
              <div className={styles.statItem} role="listitem">
                <div className={styles.statLabel}>Toko terhubung</div>
                <div className={styles.statValue}>{profiles.length}</div>
                <div className={styles.statSub}>Unit kerja</div>
              </div>
              <div className={styles.statItem} role="listitem">
                <div className={styles.statLabel}>Update terakhir</div>
                <div className={styles.statValue} style={{ fontSize: 16 }}>{latestUpdated}</div>
                <div className={styles.statSub}>Dokumen terbaru</div>
              </div>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
              <h2 className={styles.toolbarTitle}>
                SOP Terbaru
                <span className={styles.toolbarCount}>{items.length}{hasMore ? "+" : ""} dokumen</span>
              </h2>
              <div className={styles.toolbarActions}>
                <Link className={styles.btnSecondary} href="/dashboard/teams">
                  👥 Tim
                </Link>
              </div>
            </div>

            {/* SOP Grid */}
            <section className={styles.grid} aria-label="Daftar SOP">
              {items.map((sop) => (
                <Link
                  key={sop.id}
                  className={styles.sopCard}
                  href={`/dashboard/sops/${sop.id}`}
                >
                  <div className={styles.cardMeta}>
                    <span className={styles.cardStore}>{sop.toko}</span>
                    <span className={styles.cardDate}>
                      {new Date(sop.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>{sop.judul}</h3>
                </Link>
              ))}
              {items.length === 0 && (
                <div className={styles.empty}>
                  Belum ada SOP untuk toko aktif. Mulai dokumentasikan cara kerja terbaik tim Anda.
                </div>
              )}
            </section>

            {hasMore && (
              <div ref={observerTarget} className={styles.loadingMore}>
                {isLoadingMore ? "Memuat..." : "Scroll untuk melihat lebih banyak"}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Chat Panel */}
      {chatOpen && ChatPanel && (
        <ChatPanel
          store={active.toko}
          userName={active.namaPanggilan}
          onClose={() => setChatOpen(false)}
        />
      )}

      {/* Toast notifications */}
      <div className={styles.toastStack} role="log" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={styles.toast}
            onClick={() => router.push(`/dashboard/sops/${toast.sopId}`)}
          >
            <div className={styles.toastContent}>
              <div className={styles.toastTitle}>SOP {toast.type}: {toast.title}</div>
              <small className={styles.toastStore}>{toast.store}</small>
            </div>
            <button
              className={styles.closeBtn}
              aria-label="Tutup notifikasi"
              onClick={(e) => { e.stopPropagation(); dismissToast(toast.id); }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
