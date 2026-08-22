import { getGuestUser as getUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cleanSopHtml, validVideoUrl } from "@/lib/sop";
import { canCreateSop, canEditStore, type Role, type Store } from "@/lib/constants";

const json = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

async function parseBody<T>(request: Request): Promise<T | null> {
  try {
    return await request.json() as T;
  } catch {
    return null;
  }
}

export function GET() {
  return NextResponse.json({ error: "Metode GET tidak diizinkan pada endpoint ini." }, { status: 405 });
}

export function HEAD() {
  return NextResponse.json({ error: "Metode HEAD tidak diizinkan pada endpoint ini." }, { status: 405 });
}

export function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function POST(request: Request) {
  const user = await getUser();
  const profile = user.profiles.find((p: any) => p.isActive) || user.profiles[0];
  if (!user || !profile) return json("Anda harus login.", 401);
  if (!canCreateSop(profile.jabatan as Role)) return json("Peran Anda tidak dapat membuat SOP.", 403);
  const body = await parseBody<{ judul?: string; toko?: Store; contentHtml?: string; videoUrl?: string | null }>(request);
  if (!body) return json("Payload JSON tidak valid.");
  const title = body.judul?.trim() || "";
  const store = body.toko || profile.toko;
  if (title.length < 3 || title.length > 160 || !body.contentHtml?.trim()) return json("Judul dan isi SOP wajib diisi.");
  if (profile.jabatan !== "Owner" && store !== profile.toko) return json("SOP hanya dapat dibuat di toko aktif.", 403);
  const clean = cleanSopHtml(body.contentHtml);
  
  try {
    // MOCK DB BYPASS
    const data = { id: "mock-sop-" + Date.now() };
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return json(error.message, 400);
  }
}

export async function PUT(request: Request) {
  const user = await getUser();
  const profile = user.profiles.find((p: any) => p.isActive) || user.profiles[0];
  if (!user || !profile) return json("Anda harus login.", 401);
  const body = await parseBody<{ id?: string; judul?: string; contentHtml?: string; videoUrl?: string | null }>(request);
  if (!body || !body.id || !body.judul?.trim() || !body.contentHtml?.trim()) return json("SOP tidak lengkap.");
  
  // MOCK DB BYPASS
  const existing = { toko: profile.toko };
  
  if (!existing || !canEditStore(profile.jabatan as Role, existing.toko as Store, profile.toko as Store)) return json("Anda tidak memiliki akses mengedit SOP ini.", 403);
  
  try {
    // MOCK DB BYPASS
    const data = { id: body.id };
    return NextResponse.json(data);
  } catch (error: any) {
    return json(error.message);
  }
}
