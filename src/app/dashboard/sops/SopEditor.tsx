"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Store } from "@/lib/constants";
import { convertDocxToHtml } from "@/lib/performance";
import styles from "./sops.module.css";

const BlockEditor = dynamic(() => import("@/components/BlockEditor"), {
  ssr: false,
  loading: () => <div className={styles.editorSkeleton}>Memuat editor...</div>,
});

type Props = {
  store: Store;
  sop?: { id: string; judul: string; contentHtml: string; videoUrl: string | null };
};

type SaveStatus = "idle" | "saving" | "saved";

export default function SopEditor({ store, sop }: Props) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(sop?.judul || "");
  const [content, setContent] = useState(sop?.contentHtml || "");
  const [video, setVideo] = useState(sop?.videoUrl || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  async function importDocx(file: File) {
    setMessage("Mengimpor dokumen...");
    try {
      const html = await convertDocxToHtml(await file.arrayBuffer());
      setContent(html);
      setMessage("Dokumen berhasil diimpor.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Gagal memproses dokumen. Silakan coba lagi.");
      console.error(error);
    }
  }

  const handleContentChange = useCallback((html: string) => {
    setContent(html);
    setSaveStatus("idle");
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaveStatus("saving");
    setMessage("");

    try {
      const response = await fetch("/api/sops", {
        method: sop ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sop?.id,
          judul: title,
          toko: store,
          contentHtml: content,
          videoUrl: video || null,
        }),
      });

      let result: { id?: string; error?: string } = {};
      try { result = await response.json(); } catch { /**/ }

      if (!response.ok) {
        setMessage(result?.error || "SOP gagal disimpan.");
        setSaveStatus("idle");
        setBusy(false);
        return;
      }

      if (!result?.id) {
        setMessage("SOP tersimpan tapi tidak ada ID dari server.");
        setSaveStatus("idle");
        setBusy(false);
        return;
      }

      setSaveStatus("saved");
      router.push(`/dashboard/sops/${result.id}`);
      router.refresh();
    } catch {
      setMessage("Koneksi gagal. Periksa jaringan Anda.");
      setSaveStatus("idle");
      setBusy(false);
    }
  }

  return (
    <main className={styles.shell}>
      {/* Header / breadcrumb */}
      <div className={styles.editorHeader}>
        <Link className={styles.breadcrumbLink} href="/dashboard">
          ← Dashboard
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{sop ? "Edit SOP" : "SOP Baru"}</span>
        <span style={{ marginLeft: "auto", color: "var(--brand)", fontSize: 11, fontWeight: 700 }}>
          {store}
        </span>
      </div>

      <form className={styles.editorWrapper} onSubmit={submit}>
        {/* Big title input — Notion style */}
        <input
          className={styles.titleInput}
          required
          minLength={3}
          maxLength={160}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul SOP..."
          disabled={busy}
          autoFocus={!sop}
        />

        {/* Autosave status */}
        <div className={styles.autosave}>
          {saveStatus === "saving" && (
            <>
              <span className={`${styles.autosaveDot} ${styles.autosaveSavingDot}`} />
              <span className={styles.autosaveSaving}>Menyimpan...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <span className={styles.autosaveDot} />
              <span>Tersimpan</span>
            </>
          )}
        </div>

        {/* Drop zone */}
        <div
          className={styles.dropzone}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file?.name.endsWith(".docx")) void importDocx(file);
          }}
          onClick={() => fileInput.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileInput.current?.click()}
          aria-label="Import file .docx"
        >
          <input
            ref={fileInput}
            hidden
            type="file"
            accept=".docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importDocx(file);
            }}
          />
          <strong>📄 Import dari .docx</strong>
          <span>Drag & drop atau klik untuk pilih file</span>
        </div>

        {/* Block Editor */}
        <BlockEditor
          initialContent={content}
          onChange={handleContentChange}
          disabled={busy}
        />

        {/* Video URL */}
        <div>
          <span className={styles.fieldLabel}>URL Video (opsional)</span>
          <input
            className={styles.videoInput}
            type="url"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="https://youtube.com/..."
            disabled={busy}
          />
        </div>

        {message && <p className={styles.feedbackMsg}>{message}</p>}

        {/* Footer actions */}
        <div className={styles.editorFooter}>
          <Link className={styles.cancelLink} href="/dashboard">Batal</Link>
          <button className={styles.saveBtn} disabled={busy}>
            {busy ? "Menyimpan..." : sop ? "Simpan perubahan" : "Buat SOP"}
          </button>
        </div>
      </form>
    </main>
  );
}
