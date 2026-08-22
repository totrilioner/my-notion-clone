import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getGuestUser as getUser } from "@/lib/auth";
import KnowledgeClient from "./KnowledgeClient";

const DEFAULT_CATEGORIES = [
  "screen_unlock",
  "reset_forgotten_password",
  "account_lock",
  "system_software_repair",
];

export default async function KnowledgePage() {
  const user = await getUser();
  if (!user) redirect('/auth/login');
  const isAdmin = user.profiles.some((p: any) => p.jabatan === "Owner" || p.jabatan === "Admin");

  let articles: any[] = [];
  try {
    articles = await prisma.sopArticle.findMany();
  } catch (err) {
    console.error("Database table may not exist yet", err);
  }

  // Ensure default categories exist in the array
  const currentCategories = articles.map(a => a.category);
  const missingCategories = DEFAULT_CATEGORIES.filter(c => !currentCategories.includes(c));
  
  const initialArticles = [
    ...articles,
    ...missingCategories.map(cat => ({
      category: cat,
      title: `Draft: ${cat.replace(/_/g, " ")}`,
      summary: "Empty summary",
      content: "Empty content",
      searchKeywords: ""
    }))
  ];

  return <KnowledgeClient initialArticles={initialArticles} isAdmin={isAdmin} />;
}
