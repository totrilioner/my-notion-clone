"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import styles from "../sops.module.css";
import TextareaTagger from "@/components/TextareaTagger";
import MessageRenderer from "@/components/MessageRenderer";

type Question = { id: string; pertanyaan: string; frasaKunci: string[] };
type Comment = { id: string; konten: string; createdAt: string; profiles?: { namaPanggilan: string; jabatan: string }[] | null };

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SopInteractions({ sopId }: { sopId: string }) {
  const { data, mutate } = useSWR<{ questions: Question[]; comments: Comment[] }>(`/api/interactions?sopId=${sopId}`, fetcher);
  const questions = data?.questions || [];
  const comments = data?.comments || [];
  
  const [comment, setComment] = useState("");
  const [answer, setAnswer] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [logId, setLogId] = useState<string | null>(null);

  useEffect(() => {
    // Start reading log
    fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "log", sopId, mulai: new Date(startedAt).toISOString() })
    }).then(res => res.json()).then(data => {
      if (data.logId) setLogId(data.logId);
    });

    const finish = () => {
      if (document.visibilityState === "hidden" && logId) {
        navigator.sendBeacon("/api/interactions", JSON.stringify({
          type: "log",
          sopId,
          logId,
          selesai: new Date().toISOString(),
          durasi: Math.round((Date.now() - startedAt) / 1000)
        }));
      }
    };
    document.addEventListener("visibilitychange", finish);
    return () => { document.removeEventListener("visibilitychange", finish); };
  }, [sopId, startedAt, logId]);

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;

    try {
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "comment", sopId, konten: comment.trim() })
      });
      const newComment = await res.json();
      if (res.ok) {
        mutate({ questions, comments: [...comments, newComment] }, false);
        setComment("");
      } else {
        setMessage(newComment.error || "Gagal menambahkan komentar.");
      }
    } catch (err: any) {
      setMessage("Terjadi kesalahan jaringan.");
    }
  }

  function check(question: Question) {
    const value = answer[question.id]?.toLowerCase() || "";
    const passed = question.frasaKunci.filter((phrase) => value.includes(phrase.toLowerCase())).length >= 3;
    setMessage(passed ? "Lulus" : "Belum cukup, silakan coba lagi");
  }

  return (
    <section className={styles.interactions}>
      {questions.length > 0 && (
        <div className={styles.quiz}>
          <h2>Kuis pemahaman</h2>
          {questions.map((question) => (
            <div className={styles.question} key={question.id}>
              <b>{question.pertanyaan}</b>
              <textarea
                value={answer[question.id] || ""}
                onChange={(event) => setAnswer((current) => ({ ...current, [question.id]: event.target.value }))}
                placeholder="Tulis jawaban Anda..."
              />
              <button onClick={() => check(question)}>Periksa jawaban</button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.comments}>
        <h2>Komentar dan saran</h2>
        {comments.map((item) => (
          <div className={styles.comment} key={item.id}>
            <b>{item.profiles?.[0]?.namaPanggilan || "Pengguna"}</b>
            <small>{item.profiles?.[0]?.jabatan || "Tim"} · {new Date(item.createdAt).toLocaleDateString("id-ID")}</small>
            <p><MessageRenderer content={item.konten} /></p>
          </div>
        ))}
        <form onSubmit={submitComment}>
          <TextareaTagger
            value={comment}
            onChangeValue={setComment}
            placeholder="Bagikan saran untuk membuat SOP ini lebih baik... (ketik @ untuk tag SOP)"
          />
          <button>Kirim komentar</button>
        </form>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </section>
  );
}
