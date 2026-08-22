import { getGuestUser as getUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { STORES } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";



export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const toko = searchParams.get("toko");

  if (!toko || !STORES.includes(toko as typeof STORES[number])) {
    return NextResponse.json({ error: "Toko tidak valid." }, { status: 400 });
  }

  try {
    // MOCK DB BYPASS
    const messages: any[] = [];
    
    // Format to match old structure
    const formattedMessages = messages.map(m => ({
      id: m.id,
      toko: toko,
      userId: m.userId,
      nama_pengirim: m.user?.profiles?.[0]?.namaPanggilan || "Unknown",
      konten: m.konten,
      createdAt: m.createdAt
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON tidak valid." }, { status: 400 });
  }

  const toko = typeof body.toko === "string" ? body.toko.trim() : "";
  const konten = typeof body.konten === "string" ? body.konten.trim() : "";

  if (!STORES.includes(toko as typeof STORES[number])) {
    return NextResponse.json({ error: "Toko tidak valid." }, { status: 400 });
  }
  if (!konten || konten.length < 1 || konten.length > 2000) {
    return NextResponse.json({ error: "Pesan harus antara 1-2000 karakter." }, { status: 400 });
  }

  try {
    // MOCK DB BYPASS
    const data = { id: "mock-chat-" + Date.now() };
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
