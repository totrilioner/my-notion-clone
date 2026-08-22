"use server";
import prisma from "@/lib/prisma";
import { getGuestUser as getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createNotionPage(isPrivate: boolean = true) {
  try {
    const user = await getUser();
    const newPage = await prisma.notionPage.create({
      data: {
        title: "Untitled",
        content: "",
        isPrivate,
        authorId: user.id
      }
    });
    
    revalidatePath("/notion-clone");
    return { success: true, page: newPage };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateNotionPage(id: string, data: { title?: string; content?: string }) {
  try {
    const user = await getUser();
    // Validate ownership/access
    const page = await prisma.notionPage.findUnique({ where: { id } });
    if (!page || (page.isPrivate && page.authorId !== user.id)) {
      throw new Error("Unauthorized");
    }

    const updated = await prisma.notionPage.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : page.title,
        content: data.content !== undefined ? data.content : page.content,
      }
    });

    revalidatePath("/notion-clone");
    return { success: true, page: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteNotionPage(id: string) {
  try {
    const user = await getUser();
    const page = await prisma.notionPage.findUnique({ where: { id } });
    if (!page || (page.isPrivate && page.authorId !== user.id)) {
      throw new Error("Unauthorized");
    }

    await prisma.notionPage.delete({ where: { id } });
    revalidatePath("/notion-clone");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getNotionPages() {
  try {
    const user = await getUser();
    const pages = await prisma.notionPage.findMany({
      where: {
        OR: [
          { authorId: user.id }, // User's own pages
          { isPrivate: false }   // Public/Team pages
        ]
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    return { success: true, pages };
  } catch (error: any) {
    return { success: false, error: error.message, pages: [] };
  }
}
