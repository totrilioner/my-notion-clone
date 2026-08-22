"use client";

import { useEffect, useState } from "react";
import { buildObsidianMap } from "@/lib/obsidian";

type ObsidianPanelProps = {
  sopId: string;
  title: string;
  store: string;
};

export default function ObsidianPanel({ sopId, title, store }: ObsidianPanelProps) {
  const [map, setMap] = useState<{ nodes: Array<{ id: string; label: string; type: string; parentId?: string | null }> ; edges: Array<{ from: string; to: string }> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await fetch(`/api/obsidian?sopId=${encodeURIComponent(sopId)}`);
        const result = await response.json();
        if (!mounted) return;
        if (!response.ok) {
          setError(result?.error || "Tidak dapat memuat peta Obsidian.");
          return;
        }

        const fallback = buildObsidianMap(title, store);
        setMap(result?.map?.length ? { nodes: result.map.map((item: { nodeId: string; label: string; nodeType: string; parentId?: string | null }) => ({ id: item.nodeId, label: item.label, type: item.nodeType, parentId: item.parentId })), edges: [] } : fallback);
      } catch {
        if (mounted) setError("Gagal memuat peta Obsidian.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => { mounted = false; };
  }, [sopId, store, title]);

  if (loading) return <section style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, marginTop: 24 }}><strong>Obsidian</strong><p style={{ marginTop: 10 }}>Memuat peta SOP...</p></section>;
  if (error) return <section style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, marginTop: 24 }}><strong>Obsidian</strong><p style={{ marginTop: 10, color: "#b91c1c" }}>{error}</p></section>;

  const nodes = map?.nodes ?? [];
  return <section style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, marginTop: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <strong>Obsidian Mapping</strong>
      <button
        type="button"
        onClick={async () => {
          const payload = buildObsidianMap(title, store);
          await fetch("/api/obsidian", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sopId, title, store, nodes: payload.nodes }),
          });
          setMap(payload);
        }}
        style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "8px 12px", cursor: "pointer" }}
      >
        Simpan peta
      </button>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {nodes.map((node) => (
        <span key={node.id} style={{ background: "#f1f5f9", borderRadius: 999, padding: "6px 10px", fontSize: 12, border: "1px solid #cbd5e1" }}>
          {node.label}
        </span>
      ))}
      {!nodes.length && <p style={{ margin: 0, color: "#475569" }}>Belum ada node Obsidian untuk SOP ini.</p>}
    </div>
  </section>;
}
