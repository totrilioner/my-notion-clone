import { getGuestUser as getUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { canAccessObsidian } from "@/lib/obsidian";
import prisma from "@/lib/prisma";

const json = (message: string, status = 400) => NextResponse.json({ error: message }, { status });



export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sopId = searchParams.get("sopId");
  if (!sopId) return json("SOP id wajib diisi.", 400);

  const user = await getUser();
  if (!user) return json("Anda harus login.", 401);

  const profile = user.profiles.find((p: any) => p.isActive) || user.profiles[0];
  if (!profile || !canAccessObsidian(profile.jabatan as any)) return json("Anda tidak memiliki akses ke Obsidian.", 403);

  const blueprint = await prisma.sopBlueprint.findUnique({ where: { sopId } });
  const map = await prisma.obsidianMap.findMany({ where: { sopId } });

  return NextResponse.json({ blueprint, map, allowed: true });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return json("Anda harus login.", 401);

  const profile = user.profiles.find((p: any) => p.isActive) || user.profiles[0];
  if (!profile || !canAccessObsidian(profile.jabatan as any)) return json("Anda tidak memiliki akses ke Obsidian.", 403);

  const body = await request.json().catch(() => null) as { sopId?: string; title?: string; store?: string; summary?: string; nodes?: Array<{ id: string; type?: string; label?: string; parentId?: string | null; relatedTo?: string[]; metadata?: Record<string, unknown> }> } | null;
  if (!body?.sopId || !body.title || !body.store) return json("Parameter Obsidian tidak lengkap.", 400);

  const blueprint = await prisma.sopBlueprint.upsert({
    where: { sopId: body.sopId },
    update: {
      title: body.title,
      store: body.store,
      summary: body.summary || null,
      source: "manual",
    },
    create: {
      sopId: body.sopId,
      title: body.title,
      store: body.store,
      summary: body.summary || null,
      source: "manual",
    },
  });

  const mapItems = body.nodes ?? [];
  for (const node of mapItems) {
    await prisma.obsidianMap.upsert({
      where: { sopId_nodeId: { sopId: body.sopId, nodeId: node.id } },
      update: {
        nodeType: node.type || "topic",
        label: node.label || node.id,
        parentId: node.parentId || null,
        relatedTo: JSON.stringify(node.relatedTo || []),
        metadata: JSON.stringify(node.metadata ?? {}),
      },
      create: {
        sopId: body.sopId,
        nodeId: node.id,
        nodeType: node.type || "topic",
        label: node.label || node.id,
        parentId: node.parentId || null,
        relatedTo: JSON.stringify(node.relatedTo || []),
        metadata: JSON.stringify(node.metadata ?? {}),
      },
    });
  }

  return NextResponse.json({ ok: true, blueprint, allowed: true });
}
