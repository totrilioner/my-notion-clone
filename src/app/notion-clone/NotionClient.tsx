"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronRight, ChevronDown, Plus, Menu, Search, 
  Settings, Clock, Sparkles, Calendar, FileText, 
  Folder, MoreHorizontal, MessageSquare, Sun, Moon, Home, Focus, Trash2 
} from "lucide-react";
import styles from "./notion.module.css";
import BlockEditor from "@/components/BlockEditor";
import { createNotionPage, updateNotionPage, deleteNotionPage } from "./actions";

type Page = {
  id: string;
  title: string;
  content: string;
  isPrivate: boolean;
  authorId: string;
  updatedAt: string;
};

export default function NotionClient({ initialPages = [] }: { initialPages: Page[] }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    recent: false,
    private: false,
    team: false
  });

  const activePage = pages.find(p => p.id === activePageId);

  // Debounced auto-save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCreatePage = async (isPrivate: boolean) => {
    const res = await createNotionPage(isPrivate);
    if (res.success && res.page) {
      setPages([res.page, ...pages]);
      setActivePageId(res.page.id);
      if (focusMode) setFocusMode(false); // Open sidebar to show it was created
    } else {
      alert("Error creating page");
    }
  };

  const handleDeletePage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this page?")) return;
    const res = await deleteNotionPage(id);
    if (res.success) {
      setPages(prev => prev.filter(p => p.id !== id));
      if (activePageId === id) setActivePageId(null);
    }
  };

  const handleUpdateContent = (content: string) => {
    if (!activePageId) return;
    // Optimistic update locally
    setPages(prev => prev.map(p => p.id === activePageId ? { ...p, content } : p));
    
    // Auto-save to DB with debounce
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await updateNotionPage(activePageId, { content });
    }, 1000);
  };

  const handleUpdateTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activePageId) return;
    const title = e.target.value;
    setPages(prev => prev.map(p => p.id === activePageId ? { ...p, title } : p));

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await updateNotionPage(activePageId, { title });
    }, 1000);
  };

  const SidebarItem = ({ 
    icon, title, isActive = false, pageId, isPage = false 
  }: { 
    icon: React.ReactNode, title: string, isActive?: boolean, pageId?: string, isPage?: boolean 
  }) => (
    <div 
      className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ""}`} 
      onClick={() => {
        if (pageId) setActivePageId(pageId);
        else setActivePageId(null); // Go to home
      }}
    >
      <div className={styles.sidebarItemIcon}>{icon}</div>
      <span className={styles.sidebarItemText}>{title}</span>
      {isPage && pageId && (
        <button 
          className={styles.deleteBtn} 
          onClick={(e) => handleDeletePage(pageId, e)}
          title="Delete page"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );

  const privatePages = pages.filter(p => p.isPrivate);
  const teamPages = pages.filter(p => !p.isPrivate);
  const recentPages = [...pages].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ""} ${focusMode ? styles.focusMode : ""}`}>
      {/* Mobile Drawer Overlay */}
      {!sidebarOpen && !focusMode && (
        <div className={styles.mobileOverlay} onClick={() => setSidebarOpen(true)}></div>
      )}

      {/* Sidebar */}
      {!focusMode && (
        <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarClosed : ""}`}>
          <div className={styles.sidebarHeader}>
            <div className={styles.workspaceSwitcher}>
              <div className={styles.workspaceIcon}>R</div>
              <span className={styles.workspaceName}>Ruang Aditya Bayu</span>
              <ChevronDown size={14} className={styles.workspaceChevron} />
            </div>
            <button className={styles.iconButton} onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
              <Menu size={16} />
            </button>
          </div>

          <div className={styles.sidebarScrollable}>
            <div className={styles.sidebarGroup}>
              <SidebarItem icon={<Search size={16} />} title="Pencarian" />
              <SidebarItem icon={<Settings size={16} />} title="Pengaturan & anggota" />
            </div>

            <div className={styles.sidebarGroup}>
              <SidebarItem icon={<Home size={16} />} title="Beranda" isActive={activePageId === null} />
              <SidebarItem icon={<Calendar size={16} />} title="Hubungkan kalender Anda" />
              <SidebarItem icon={<Sparkles size={16} />} title="Catatan rapat AI baru" />
            </div>

            {/* Terbaru */}
            <div className={styles.sidebarSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('recent')}>
                {collapsedSections.recent ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                <span className={styles.sectionTitle}>Terbaru</span>
              </div>
              {!collapsedSections.recent && (
                <div className={styles.sectionContent}>
                  {recentPages.map(p => (
                    <SidebarItem key={`recent-${p.id}`} icon={<FileText size={16} />} title={p.title} isActive={activePageId === p.id} pageId={p.id} isPage />
                  ))}
                </div>
              )}
            </div>

            {/* Privat */}
            <div className={styles.sidebarSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('private')}>
                {collapsedSections.private ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                <span className={styles.sectionTitle}>Privat</span>
                <button className={styles.addBtn} onClick={(e) => { e.stopPropagation(); handleCreatePage(true); }}>
                  <Plus size={14} />
                </button>
              </div>
              {!collapsedSections.private && (
                <div className={styles.sectionContent}>
                  {privatePages.map(p => (
                    <SidebarItem key={p.id} icon={<FileText size={16} />} title={p.title} isActive={activePageId === p.id} pageId={p.id} isPage />
                  ))}
                  <div className={styles.sidebarItem} onClick={() => handleCreatePage(true)}>
                    <div className={styles.sidebarItemIcon}><Plus size={16} /></div>
                    <span className={styles.sidebarItemText}>Tambah baru</span>
                  </div>
                </div>
              )}
            </div>

            {/* Ruang Tim */}
            <div className={styles.sidebarSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('team')}>
                {collapsedSections.team ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                <span className={styles.sectionTitle}>Ruang tim</span>
                <button className={styles.addBtn} onClick={(e) => { e.stopPropagation(); handleCreatePage(false); }}>
                  <Plus size={14} />
                </button>
              </div>
              {!collapsedSections.team && (
                <div className={styles.sectionContent}>
                  {teamPages.map(p => (
                    <SidebarItem key={p.id} icon={<Folder size={16} />} title={p.title} isActive={activePageId === p.id} pageId={p.id} isPage />
                  ))}
                  <div className={styles.sidebarItem} onClick={() => handleCreatePage(false)}>
                    <div className={styles.sidebarItemIcon}><Plus size={16} /></div>
                    <span className={styles.sidebarItemText}>Tambahkan yang baru</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.sectionTitle}>Aplikasi Notion</div>
            <div className={styles.appCard}>
              <div className={styles.appCardTitle}>Pisahkan pekerjaan dan kehidupan pribadi</div>
              <button className={styles.appCardBtn}>Tambahkan akun kerja Anda →</button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.mainHeader}>
          <div className={styles.headerLeft}>
            {!sidebarOpen && !focusMode && (
              <button className={styles.menuToggle} onClick={() => setSidebarOpen(true)}>
                <Menu size={18} />
              </button>
            )}
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbItem}>Ruang Aditya Bayu</span>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{activePage ? activePage.title : "Beranda"}</span>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.iconButton} onClick={() => setFocusMode(!focusMode)} aria-label="Toggle Focus Mode" title="Zen Focus Mode">
              <Focus size={18} color={focusMode ? "#3b82f6" : "currentColor"} />
            </button>
            <button className={styles.iconButton} onClick={() => setDarkMode(!darkMode)} aria-label="Toggle Dark Mode" title="Tema Terang/Gelap">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className={styles.iconButton}><MoreHorizontal size={18} /></button>
          </div>
        </header>

        <div className={styles.content}>
          {activePage ? (
            <div className={styles.editorWrapper}>
              <input 
                type="text"
                value={activePage.title}
                onChange={handleUpdateTitle}
                className={styles.titleInput}
                placeholder="Untitled"
              />
              <div className={styles.editorContainer}>
                {/* Ensure BlockEditor has a key to re-mount properly if needed, but it might lose focus. 
                    Better to just rely on initialContent if it handles updates, but Tiptap needs care when content changes externally.
                    Assuming BlockEditor can handle its initialContent. */}
                <BlockEditor 
                  key={activePage.id} // Re-mount when active page changes
                  initialContent={activePage.content} 
                  onChange={handleUpdateContent} 
                />
              </div>
            </div>
          ) : (
            <>
              <h1 className={styles.pageTitle}>Beranda</h1>
              <div className={styles.actionCards}>
                <div className={styles.actionCard}>
                  <div className={styles.actionCardIcon}><Calendar size={24} color="#6B6B6B" /></div>
                  <div>
                    <h3 className={styles.actionCardTitle}>Hubungkan kalender Anda</h3>
                    <p className={styles.actionCardDesc}>Lihat semua acara Anda dan mulai membuat catatan rapat untuk acara tersebut.</p>
                  </div>
                </div>
                
                <div className={`${styles.actionCard} ${styles.actionCardSmall}`}>
                  <div className={styles.actionCardIcon}><Sparkles size={20} color="#6B6B6B" /></div>
                  <h3 className={styles.actionCardTitle}>Catatan rapat AI baru</h3>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
