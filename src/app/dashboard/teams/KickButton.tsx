"use client";

import { useState, useTransition } from "react";
import { kickTeamMember } from "./actions";
import styles from "./teams.module.css";

export default function KickButton({ profileId, profileName }: { profileId: string, profileName: string }) {
  const [isPending, startTransition] = useTransition();

  const handleKick = () => {
    if (confirm(`Apakah Anda yakin ingin mengeluarkan ${profileName} dari tim?`)) {
      startTransition(async () => {
        try {
          await kickTeamMember(profileId);
          alert(`${profileName} berhasil dikeluarkan.`);
        } catch (error: any) {
          alert(error.message || "Terjadi kesalahan saat mengeluarkan anggota.");
        }
      });
    }
  };

  return (
    <button 
      onClick={handleKick} 
      disabled={isPending}
      className={styles.kickButton}
      title={`Keluarkan ${profileName}`}
    >
      {isPending ? "⏳" : "Keluar (Kick)"}
    </button>
  );
}
