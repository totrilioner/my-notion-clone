import { getGuestUser as getUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sopId = searchParams.get("sopId");
  if (!sopId) return NextResponse.json({ error: "SOP id wajib diisi." }, { status: 400 });

  const questions = await prisma.quizQuestion.findMany({
    where: { sopId: sopId },
    select: { id: true, pertanyaan: true, frasaKunci: true }
  });

  const comments = await prisma.comment.findMany({
    where: { sopId: sopId },
    select: {
      id: true,
      konten: true,
      createdAt: true,
      user: { select: { profiles: { select: { namaPanggilan: true, jabatan: true } } } }
    },
    orderBy: { createdAt: 'asc' }
  });

  // format comments to match expected structure
  const formattedComments = comments.map(c => ({
    id: c.id,
    konten: c.konten,
    createdAt: c.createdAt,
    profiles: c.user?.profiles || []
  }));

  return NextResponse.json({ questions, comments: formattedComments });
}

export async function POST(request: NextRequest) {
  const user = await prisma.user.findFirst({
    where: { email: "guest@example.com" }
  });

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { sopId, type } = body;

  if (type === "comment") {
    const { konten } = body;
    if (!konten) return NextResponse.json({ error: "Konten wajib diisi" }, { status: 400 });

    const newComment = await prisma.comment.create({
      data: {
        sopId: sopId,
        userId: user.id,
        konten: konten
      },
      select: {
        id: true,
        konten: true,
        createdAt: true,
        user: { select: { profiles: { select: { namaPanggilan: true, jabatan: true } } } }
      }
    });

    return NextResponse.json({
      id: newComment.id,
      konten: newComment.konten,
      createdAt: newComment.createdAt,
      profiles: newComment.user?.profiles || []
    });
  } else if (type === "log") {
    const { mulai, selesai, durasi } = body;
    if (mulai && !selesai) {
      const log = await prisma.readingLog.create({
        data: {
          sopId: sopId,
          userId: user.id,
          mulai: new Date(mulai)
        },
        select: { id: true }
      });
      return NextResponse.json({ logId: log.id });
    } else if (selesai && body.logId) {
      await prisma.readingLog.update({
        where: { id: body.logId },
        data: {
          selesai: new Date(selesai),
          durasi: durasi
        }
      });
      return NextResponse.json({ success: true });
    }
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
