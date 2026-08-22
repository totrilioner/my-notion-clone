import { getGuestUser as getUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  try {
    const sops = await prisma.sop.findMany({
      where: {
        judul: {
          contains: query
        }
      },
      select: {
        id: true,
        judul: true,
        toko: true,
        contentClean: true
      },
      take: 10
    });

    // Parse contentClean to extract headings for section tagging
    const results = sops.map(sop => {
      const headings: { id: string; text: string; level: number }[] = [];
      if (sop.contentClean) {
        // Simple regex to match <h1>, <h2>, <h3>
        const regex = /<h([1-3])[^>]*>(.*?)<\/h\1>/gi;
        let match;
        while ((match = regex.exec(sop.contentClean)) !== null) {
          const level = parseInt(match[1], 10);
          const rawText = match[2].replace(/<[^>]+>/g, "").trim();
          // Generate a slug-like ID if not present
          const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          if (rawText) {
            headings.push({ id, text: rawText, level });
          }
        }
      }

      return {
        id: sop.id,
        judul: sop.judul,
        toko: sop.toko,
        headings
      };
    });

    return NextResponse.json({ sops: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
