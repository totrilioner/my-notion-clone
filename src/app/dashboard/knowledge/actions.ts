"use server";
import prisma from "@/lib/prisma";
import { getGuestUser as getUser } from "@/lib/auth";

export async function updateSopArticle(data: { category: string; title: string; summary: string; content: string; searchKeywords: string }) {
  try {
    const user = await getUser();
    
    // In actual implementation, you'd check for admin role here.
    const article = await prisma.sopArticle.upsert({
      where: { category: data.category },
      update: {
        title: data.title,
        summary: data.summary,
        content: data.content,
        searchKeywords: data.searchKeywords,
        updatedByUserId: user.id
      },
      create: {
        category: data.category,
        title: data.title,
        summary: data.summary,
        content: data.content,
        searchKeywords: data.searchKeywords,
        updatedByUserId: user.id
      }
    });

    return { success: true, article };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
