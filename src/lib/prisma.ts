import { PrismaClient } from '@prisma/client'

// MOCK PRISMA BYPASS FOR DEVELOPMENT WITHOUT DATABASE
// Ini mencegat semua panggilan ke Prisma sehingga tidak akan crash meskipun database offline.
const mockPrisma = new Proxy({}, {
  get: function(target, prop) {
    if (prop === '$connect' || prop === '$disconnect') return async () => {};
    if (prop === '$transaction') return async (cb: any) => {
      if (Array.isArray(cb)) return Promise.all(cb);
      return cb(mockPrisma);
    };

    return new Proxy({}, {
      get: function(modelTarget, method) {
        return async function(...args: any[]) {
          console.log(`[MOCK PRISMA] ${String(prop)}.${String(method)} called`);
          if (method === 'findMany') {
            if (String(prop) === 'sop') {
               return [{
                 id: "mock-sop-123",
                 judul: "SOP Pelayanan Pelanggan",
                 toko: "Semarang",
                 updatedAt: new Date(),
                 contentClean: "<h1>Pembukaan</h1><p>Halo</p><h2>Prosedur Retur</h2><p>Langkah</p>"
               }];
            }
            return [];
          }
          if (method === 'count') return 0;
          if (method === 'create' || method === 'update' || method === 'upsert') {
            return { id: "mock-id-123", toko: "Semarang", updatedAt: new Date() };
          }
          if (method === 'findUnique' || method === 'findFirst') {
            // Memberikan data default untuk halaman detail
            return {
               id: args[0]?.where?.id || "mock-id-123", 
               judul: "Data Simulasi (Tanpa DB)", 
               toko: args[0]?.where?.toko || "Semarang", 
               updatedAt: new Date(),
               contentClean: "<p>Database belum terhubung. Ini adalah data simulasi (mock) agar Anda bisa melihat-lihat aplikasi.</p>",
               isActive: true,
               izinTampilDashboard: true,
               jabatan: "Karyawan"
            };
          }
          return null;
        }
      }
    });
  }
});

const prismaClientSingleton = () => {
  return mockPrisma as unknown as PrismaClient;
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

// FIX: Abaikan cache globalThis agar perubahan mock ini langsung aktif
// tanpa harus me-restart server Next.js.
const prisma = prismaClientSingleton()
globalThis.prismaGlobal = prisma

export default prisma
