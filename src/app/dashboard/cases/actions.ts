"use server";
import prisma from "@/lib/prisma";
import { getGuestUser as getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateComplaintCase(data: {
  caseId: string;
  status?: string;
  classification?: string;
  notes?: string;
}) {
  try {
    const user = await getUser();
    // Validate role for updating (in a real app)
    
    await prisma.complaintCase.update({
      where: { id: data.caseId },
      data: {
        status: data.status,
        classification: data.classification,
        notes: data.notes
      }
    });

    revalidatePath("/dashboard/cases");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function assignComplaintCase(data: {
  caseId: string;
  assignedToUserId: string;
}) {
  try {
    await getUser(); // Auth check
    
    await prisma.complaintCase.update({
      where: { id: data.caseId },
      data: {
        assignedToUserId: data.assignedToUserId
      }
    });

    revalidatePath("/dashboard/cases");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
