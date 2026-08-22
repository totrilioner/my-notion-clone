"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ROLES, STORES } from "@/lib/constants";
import styles from "./auth.module.css";

export default function AuthForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", role: "Staff", store: STORES[0] });

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");

    if (!form.phone || !form.name) {
      setError("Nomor HP dan Nama wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const signInRes = await signIn("credentials", {
        redirect: false,
        phone: form.phone,
        name: form.name,
        role: form.role,
        store: form.store,
      });

      if (signInRes?.error) {
        throw new Error(signInRes.error);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("AUTH ERROR:", err);
      setError(err instanceof Error ? err.message : "Sinyal error, silakan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <Link className={styles.back} href="/">← mbalik</Link>
        <div className={styles.logo}>
          <Image src="/logo/raycorp-logo.svg" alt="RayCorp" width={48} height={48} priority />
        </div>
        <h1 className={styles.heading}>Mari masuk.</h1>
        <p className={styles.subheading}>Masukkan identitas Anda untuk masuk ke workspace.</p>
        
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.field}>
            <label htmlFor="phone">Nomor HP</label>
            <input id="phone" name="phone" required type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="08123456789" />
          </div>
          
          <div className={styles.field}>
            <label htmlFor="name">Nama Panggilan</label>
            <input id="name" name="name" required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Contoh: Budi" />
          </div>
          
          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="role">Jabatan</label>
              <select id="role" name="role" value={form.role} onChange={(event) => update("role", event.target.value)}>
                {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            
            <div className={styles.field}>
              <label htmlFor="store">Toko</label>
              <select id="store" name="store" value={form.store} onChange={(event) => update("store", event.target.value)}>
                {STORES.map((store) => <option key={store} value={store}>{store}</option>)}
              </select>
            </div>
          </div>
          
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.button} disabled={loading}>{loading ? "proses sabar..." : "Masuk"}</button>
        </form>
      </section>
    </main>
  );
}
