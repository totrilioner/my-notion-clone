"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import type { Store } from "@/lib/constants";
import styles from "./chat-panel.module.css";
import TextareaTagger from "./TextareaTagger";
import MessageRenderer from "./MessageRenderer";

type Message = {
  id: string;
  toko: string;
  userId: string;
  nama_pengirim: string;
  konten: string;
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ChatPanel({
  store,
  userName,
  onClose,
}: {
  store: Store;
  userName: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data, isLoading } = useSWR<{ messages: Message[] }>(
    `/api/chat?toko=${encodeURIComponent(store)}`,
    fetcher,
    { refreshInterval: 3000 }
  );

  useEffect(() => {
    if (data?.messages) {
      setMessages(data.messages);
      scrollToBottom();
    }
  }, [data]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sending) return;

    const content = input.trim();
    setInput("");
    setSending(true);

    try {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempMsg: Message = {
        id: tempId,
        toko: store,
        userId: "temp",
        nama_pengirim: userName,
        konten: content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMsg]);
      scrollToBottom();

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toko: store,
          konten: content,
          nama_pengirim: userName,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send");
      }
      
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim pesan");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div className={styles.panel} role="dialog" aria-label="Chat Tim">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>💬</div>
          <div className={styles.headerInfo}>
            <div className={styles.headerTitle}>Chat Tim {store}</div>
            <div className={styles.headerSub}>
              <span className={styles.onlineDot} /> Online
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>

        {/* Messages */}
        <div className={styles.messages} ref={scrollRef}>
          {isLoading && messages.length === 0 ? (
            <div className={styles.loadingState}>Memuat obrolan...</div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyState}>
              Belum ada pesan. Mulai sapa tim Anda! 👋
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isOwn = msg.nama_pengirim === userName;
              const showAvatar =
                idx === 0 || messages[idx - 1].nama_pengirim !== msg.nama_pengirim;
              
              const prevDate = idx > 0 ? new Date(messages[idx-1].createdAt).toLocaleDateString() : null;
              const currDate = new Date(msg.createdAt).toLocaleDateString();
              const showDate = prevDate !== currDate;

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className={styles.dateDivider}>
                      {currDate}
                    </div>
                  )}
                  <div className={`${styles.messageRow} ${isOwn ? styles.messageRowOwn : ""}`}>
                    {showAvatar ? (
                      <div className={`${styles.avatar} ${isOwn ? styles.avatarOwn : ""}`}>
                        {msg.nama_pengirim.charAt(0)}
                      </div>
                    ) : (
                      <div style={{ width: 28, flexShrink: 0 }} /> // Placeholder for alignment
                    )}
                    <div className={styles.messageGroup}>
                      {showAvatar && (
                        <div className={styles.messageMeta}>
                          <span className={styles.senderName}>
                            {isOwn ? "Anda" : msg.nama_pengirim}
                          </span>
                          <span className={styles.messageTime}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : ""}`}>
                        <MessageRenderer content={msg.konten} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <form className={styles.inputArea} onSubmit={handleSend}>
          <div className={styles.inputWrapper}>
            <TextareaTagger
              ref={inputRef}
              className={styles.textarea}
              placeholder={`Tulis pesan untuk ${store} (ketik @ untuk tag SOP)...`}
              value={input}
              onChangeValue={setInput}
              onEnter={handleSend as any}
              disabled={sending || isLoading}
              rows={1}
            />
          </div>
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!input.trim() || sending || isLoading}
            aria-label="Kirim"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
