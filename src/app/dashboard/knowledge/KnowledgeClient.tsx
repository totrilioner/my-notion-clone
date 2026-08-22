"use client";

import { useState, useMemo, useEffect } from "react";
import { updateSopArticle } from "./actions";
import styles from "./knowledge.module.css";

// SVG Icons
function IconSearch() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function IconArrowRight() { return <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>; }
function IconLoader() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={styles.spin}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"/></svg>; }

const categoryMeta: Record<string, { label: string, color: string }> = {
  screen_unlock: { label: "Screen Unlock", color: "#e0f2fe" },
  reset_forgotten_password: { label: "Reset Password", color: "#fef08a" },
  account_lock: { label: "Account Lock", color: "#ffedd5" },
  system_software_repair: { label: "System Repair", color: "#dcfce7" },
};

type Article = { id?: string; category: string; title: string; summary: string; content: string; searchKeywords: string };

export default function KnowledgeClient({ initialArticles, isAdmin }: { initialArticles: Article[], isAdmin: boolean }) {
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [draft, setDraft] = useState({ title: "", summary: "", content: "", searchKeywords: "" });
  const [isPending, setIsPending] = useState(false);

  const filteredArticles = useMemo(() => {
    if (!search) return articles;
    return articles.filter(a => 
      a.title.toLowerCase().includes(search.toLowerCase()) || 
      a.summary.toLowerCase().includes(search.toLowerCase()) || 
      a.searchKeywords.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, articles]);

  const selected = articles.find(a => a.category === selectedCategory) ?? filteredArticles[0];

  useEffect(() => {
    if (selected) {
      setDraft({ title: selected.title, summary: selected.summary, content: selected.content, searchKeywords: selected.searchKeywords });
    }
  }, [selected?.category]); // Re-run when category changes

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setIsPending(true);
    const res = await updateSopArticle({ category: selected.category, ...draft });
    setIsPending(false);
    
    if (res.success && res.article) {
      setArticles(prev => prev.map(a => a.category === selected.category ? res.article as Article : a));
      alert("SOP Saved Successfully.");
    } else {
      alert("Failed to save SOP: " + res.error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Knowledge Base</span>
        <h1 className={styles.title}>The four approved paths.</h1>
        <p className={styles.description}>Searchable operational guidance limited to the four supported complaint categories.</p>
      </header>
      
      <div className={styles.searchBar}>
        <IconSearch />
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search SOP terms, symptoms, or account locks" 
          className={styles.searchInput} 
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.articleList}>
          {filteredArticles.map(article => {
            const meta = categoryMeta[article.category] || { label: article.category, color: "#eee" };
            const isSelected = selected?.category === article.category;
            return (
              <article key={article.category} className={`${styles.articleCard} ${isSelected ? styles.articleSelected : ""}`}>
                <div className={styles.iconBox} style={{ backgroundColor: meta.color }}>
                  {/* Category icon placeholder */}
                </div>
                <h2 className={styles.articleTitle}>{article.title}</h2>
                <p className={styles.articleSummary}>{article.summary}</p>
                <button onClick={() => setSelectedCategory(article.category)} className={styles.readBtn}>
                  Read guidance <IconArrowRight />
                </button>
              </article>
            );
          })}
        </div>
        
        {selected && (
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <span className={styles.statusPill}>{categoryMeta[selected.category]?.label || selected.category}</span>
              {isAdmin && <span className={styles.adminLabel}>Admin editable</span>}
            </div>
            
            <h2 className={styles.sidebarTitle}>{selected.title}</h2>
            
            {isAdmin ? (
              <form className={styles.form} onSubmit={handleSave}>
                <input value={draft.title} onChange={e => setDraft({...draft, title: e.target.value})} className={styles.input} placeholder="Title" />
                <textarea value={draft.summary} onChange={e => setDraft({...draft, summary: e.target.value})} className={styles.textareaShort} placeholder="Summary" />
                <textarea value={draft.content} onChange={e => setDraft({...draft, content: e.target.value})} className={styles.textareaLong} placeholder="Content" />
                <input value={draft.searchKeywords} onChange={e => setDraft({...draft, searchKeywords: e.target.value})} className={styles.input} placeholder="Search Keywords" />
                <button type="submit" disabled={isPending} className={styles.submitBtn}>
                  {isPending && <IconLoader />} Save SOP
                </button>
              </form>
            ) : (
              <p className={styles.contentDisplay}>{selected.content}</p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
