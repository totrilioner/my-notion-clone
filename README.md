# RayCorp Workspace

Workspace SOP full-stack dengan Next.js App Router, TypeScript, CSS Modules, Supabase, Realtime, dan Vercel.

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Isi `.env.local` dengan:

```env
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

Jalankan isi `supabase/migrations/001_init.sql` di Supabase SQL Editor. Migration tersebut membuat tabel profil, SOP, kuis, komentar, reading log, RLS policy, index, dan mengaktifkan Supabase Realtime pada `sops`.

## Fitur yang tersedia

- Landing, login, dan registrasi dengan validasi password di browser serta API server.
- Profil toko aktif, role-based access, filter SOP, dan realtime toast untuk perubahan SOP.
- CRUD SOP melalui API dengan sanitasi HTML server-side.
- Import `.docx` client-side memakai Mammoth dan preview HTML.
- Kuis berbasis tiga frasa kunci, komentar kronologis, dan reading logs.
- Owner dashboard dengan grafik aktivitas menggunakan Recharts.
- Responsive mobile-first CSS Modules tanpa Tailwind dan animasi native CSS.

## Deploy ke Vercel

Hubungkan repository ke Vercel dan isi tiga environment variable di atas pada Project Settings untuk Development, Preview, dan Production. `SUPABASE_SERVICE_KEY` hanya dipakai route server register dan tidak boleh diberi prefix `NEXT_PUBLIC_`.

Validasi lokal:

```bash
npm run lint
npm run build
```
