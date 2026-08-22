import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, role, store } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      // Update existing user (overwrites password and profile, keeps relations like SOPs)
      const user = await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
          profiles: {
            deleteMany: {}, // Hapus profil lama
            create: {
              namaPanggilan: name,
              jabatan: role || "Tim Store",
              toko: store || "Pusat",
              telepon: phone || "",
              isActive: true,
              izinTampilDashboard: true
            }
          }
        }
      });
      return NextResponse.json({ message: "User updated successfully", user: { id: user.id, email: user.email } }, { status: 201 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profiles: {
          create: {
            namaPanggilan: name,
            jabatan: role || "Tim Store",
            toko: store || "Pusat",
            telepon: phone || "",
            isActive: true,
            izinTampilDashboard: true
          }
        }
      }
    });

    return NextResponse.json({ message: "User created successfully", user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error: any) {
    require('fs').appendFileSync('debug.log', new Date().toISOString() + ' - Register Error: ' + error.message + '\n' + error.stack + '\n\n');
    return NextResponse.json({ message: error.message || "Unknown error occurred" }, { status: 500 });
  }
}
