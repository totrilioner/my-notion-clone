"use server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getGuestUser as getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createComplaintCase(data: {
  customerName: string;
  customerContact: string;
  deviceBrand: string;
  deviceModel: string;
  deviceCondition: string;
  customerAnswers: Record<string, string>;
  dataLossConsent: boolean;
  notes: string;
}) {
  try {
    const user = await getUser();
  if (!user) redirect('/auth/login');

    // Recommendation logic based on answers
    let recommendedCategory = "screen_unlock";
    const answers = data.customerAnswers;
    if (answers.systemSymptoms) recommendedCategory = "system_software_repair";
    else if (answers.accountPrompt) recommendedCategory = "account_lock";
    else if (answers.resetHistory) recommendedCategory = "reset_forgotten_password";

    const caseReference = `CAS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newCase = await prisma.complaintCase.create({
      data: {
        caseReference,
        customerName: data.customerName,
        customerContact: data.customerContact,
        deviceBrand: data.deviceBrand,
        deviceModel: data.deviceModel,
        deviceCondition: data.deviceCondition,
        customerAnswers: JSON.stringify(data.customerAnswers),
        dataLossConsent: data.dataLossConsent,
        notes: data.notes,
        recommendedCategory,
        classification: recommendedCategory, // Default classification to recommendation
        status: "new",
        createdByUserId: user.id,
      },
    });

    revalidatePath("/dashboard/cases");
    return { success: true, caseReference: newCase.caseReference };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
