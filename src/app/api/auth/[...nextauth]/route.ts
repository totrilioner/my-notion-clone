import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Nomor HP", type: "text" },
        name: { label: "Nama Panggilan", type: "text" },
        role: { label: "Jabatan", type: "text" },
        store: { label: "Toko Pertama", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.name || !credentials?.role || !credentials?.store) {
          throw new Error("Semua data (HP, Nama, Jabatan, Toko) wajib diisi");
        }
        
        // We use phone as an internal email identifier for NextAuth
        const emailIdentifier = `${credentials.phone.replace(/[^0-9]/g, '')}@app.local`;

        let user = await prisma.user.findUnique({
          where: { email: emailIdentifier }
        });

        if (!user) {
          // Register automatically
          user = await prisma.user.create({
            data: {
              name: credentials.name,
              email: emailIdentifier,
            }
          });
          
          await prisma.profile.create({
            data: {
              userId: user.id,
              namaPanggilan: credentials.name,
              telepon: credentials.phone,
              jabatan: credentials.role,
              toko: credentials.store,
              izinTampilDashboard: true,
              isActive: true,
            }
          });
        } else {
          // Update profile if they login again with different details
          await prisma.profile.updateMany({
            where: { userId: user.id },
            data: {
              namaPanggilan: credentials.name,
              jabatan: credentials.role,
              toko: credentials.store,
              isActive: true,
            }
          });
        }

        return user;
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        
        const userProfile = await prisma.profile.findFirst({
          where: { userId: token.id as string }
        });
        
        if (userProfile) {
          (session.user as any).profile = userProfile;
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "default-secret-key-for-dev",
  pages: {
    signIn: '/auth/login',
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
