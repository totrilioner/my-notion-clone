"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ROLES, STORES } from "@/lib/constants";
import styles from "./auth.module.css";

type Mode = "login" | "register";

function validPassword(password: string) {
  return password.length >= 3;
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "Owner", store: STORES[0], password: "", publicProfile: false });
  const isRegister = mode === "register";
  const update = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  async function parseJsonSafe(response: Response) {
    const clone = response.clone();
    try {
      return await clone.json();
    } catch {
      const text = await clone.text().catch(() => "");
      const statusMessage = response.statusText || `Server ${response.status}`;
      return {
        error: text
          ? text.replace(/<[^>]+>/g, "").trim() || statusMessage
          : statusMessage,
      };
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) {
      return;
    }

    setError("");

    if (isRegister && !validPassword(form.password)) {
      setError("Sandi minimal 3 karakter.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone,
            role: form.role,
            store: form.store
          })
        });
        
        if (!res.ok) {
          const data = await parseJsonSafe(res);
          throw new Error(data.error || data.message || "Gagal mendaftar");
        }

        // Auto login after register
        const signInRes = await signIn("credentials", {
          redirect: false,
          email: form.email,
          password: form.password,
        });

        if (signInRes?.error) {
          throw new Error("Gagal login otomatis setelah mendaftar");
        }
        
        router.push("/dashboard");
        router.refresh();
      } else {
        const signInRes = await signIn("credentials", {
          redirect: false,
          email: form.email,
          password: form.password,
        });

        if (signInRes?.error) {
          throw new Error("Email atau sandi salah");
        }

        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("AUTH ERROR:", err);
      setError(err instanceof Error ? err.message : "Sinyal error, silakan coba lagi.");
      setLoading(false);
    }
  }

  return <main className={styles.shell}><section className={styles.card}>
    <Link className={styles.back} href="/">← mbalik</Link>
    <div className={styles.logo}><Image src="/logo/raycorp-logo.svg" alt="RayCorp" width={48} height={48} priority /></div>
    <h1 className={styles.heading}>{isRegister ? "Mari tumbuh bersama." : "Selamat datang di workspace"}</h1>
    <p className={styles.subheading}>{isRegister ? "Buat akun workspace untuk mulai berbagi cara kerja terbaik." : "Masuk untuk melanjutkan ritme kerja tim Anda."}</p>
    <form className={styles.form} onSubmit={submit}>
      {isRegister && <>
        <div className={styles.field}>
          <label htmlFor="name">jeneng panggilan</label>
          <input id="name" name="name" required value={form.name} onChange={(event) => update("name", event.target.value)} />
        </div>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="phone">Nomor hpmu</label>
            <input id="phone" name="phone" required type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="role">Jabatan</label>
            <select id="role" name="role" value={form.role} onChange={(event) => update("role", event.target.value)}>
              {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="store">Toko pertama</label>
          <select id="store" name="store" value={form.store} onChange={(event) => update("store", event.target.value)}>
            {STORES.map((store) => <option key={store} value={store}>{store}</option>)}
          </select>
        </div>
      </>}
      <div className={styles.field}><label htmlFor="email">Email</label><input id="email" name="email" required type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></div>
      <div className={styles.field}><label htmlFor="password">Sandine sek iso di eling ya</label><input id="password" name="password" required type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={form.password} onChange={(event) => update("password", event.target.value)} />{isRegister && <small className={styles.subheading}>Minimal 3 karakter.</small>}</div>
      {isRegister && <label className={styles.check}><input type="checkbox" name="publicProfile" checked={form.publicProfile} onChange={(event) => update("publicProfile", event.target.checked)} /><span>Tampilkan profil saya di dashboard publik (nama, jabatan, toko).</span></label>}
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.button} disabled={loading}>{loading ? "proses sabar..." : isRegister ? "Buat akun" : "Masuk"}</button>
    </form>
    <p className={styles.footer}>{isRegister ? "Sudah punya akun?" : "Ga sah Crigis?"} <Link href={isRegister ? "/auth/login" : "/auth/register"}>{isRegister ? "Masuk" : "Daftar"}</Link></p>
  </section></main>;
}
