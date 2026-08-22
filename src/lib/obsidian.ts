import { canEditSop, type Role } from "@/lib/constants";

export type ObsidianNode = {
  id: string;
  type: "topic" | "task" | "decision" | "document";
  label: string;
  parentId?: string | null;
  relatedTo?: string[];
  metadata?: Record<string, unknown>;
};

export function canAccessObsidian(role: Role) {
  return canEditSop(role);
}

export function buildObsidianMap(sopTitle: string, store: string, summary?: string) {
  const title = sopTitle.trim() || "SOP";
  const nodes: ObsidianNode[] = [
    {
      id: `${store}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      type: "document",
      label: title,
      metadata: { store, summary: summary?.trim() || "" },
    },
    {
      id: `${store}-workflow`,
      type: "topic",
      label: `${store} workflow`,
      parentId: `${store}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      metadata: { scope: store },
    },
  ];

  return {
    nodes,
    edges: [
      { from: `${store}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, to: `${store}-workflow` },
    ],
  };
}
