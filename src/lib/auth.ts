import prisma from "@/lib/prisma";

export async function getGuestUser() {
  // Hardcoded mock user untuk bypass login database
  const user = {
    id: "dummy-user-id",
    email: "guest@example.com",
    name: "Guest User",
    profiles: [
      {
        id: "dummy-profile-id",
        userId: "dummy-user-id",
        namaPanggilan: "Guest",
        jabatan: "Owner", // Memberikan akses Owner
        toko: "Pusat",
        telepon: "",
        isActive: true
      }
    ]
  };
  return user as any;
}
