"use client";

import React, { useState, useRef, KeyboardEvent, useImperativeHandle } from "react";
import useSWR from "swr";
import styles from "./tagger.module.css";

type Heading = { id: string; text: string; level: number };
type Sop = { id: string; judul: string; toko: string; headings: Heading[] };

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface TextareaTaggerProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChangeValue: (val: string) => void;
  onEnter?: () => void;
}

const TextareaTagger = React.forwardRef<HTMLTextAreaElement, TextareaTaggerProps>(
  ({ value, onChangeValue, onEnter, ...props }, ref) => {
    const [query, setQuery] = useState<string | null>(null);
    const [cursorIdx, setCursorIdx] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    
    const internalRef = useRef<HTMLTextAreaElement>(null);
    
    // Merge refs
    useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);
  const { data } = useSWR<{ sops: Sop[] }>(
    query !== null ? `/api/sops/search?q=${encodeURIComponent(query)}` : null,
    fetcher
  );

  // Flatten options: SOPs and their headings
  const options = React.useMemo(() => {
    if (!data?.sops) return [];
    const list: { type: "sop" | "heading"; id: string; text: string; sopId: string; sopJudul: string }[] = [];
    data.sops.forEach(sop => {
      list.push({ type: "sop", id: sop.id, text: sop.judul, sopId: sop.id, sopJudul: sop.judul });
      sop.headings.forEach(h => {
        list.push({ type: "heading", id: h.id, text: h.text, sopId: sop.id, sopJudul: sop.judul });
      });
    });
    return list;
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChangeValue(val);

    const cursor = e.target.selectionStart;
    
    // Find if we are typing after an '@'
    const textBeforeCursor = val.slice(0, cursor);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9 ]*)$/);
    if (match) {
      setQuery(match[1]);
      setCursorIdx(cursor - match[0].length);
      setActiveIndex(0);
    } else {
      setQuery(null);
      setCursorIdx(null);
    }
  };

  const insertTag = (option: typeof options[number]) => {
    if (cursorIdx === null || !internalRef.current) return;
    
    const textBefore = value.slice(0, cursorIdx);
    const textAfter = value.slice(internalRef.current.selectionStart);
    
    let tag = "";
    if (option.type === "sop") {
      tag = `[@SOP: ${option.sopJudul}](/dashboard/sops/${option.sopId})`;
    } else {
      tag = `[@SOP: ${option.sopJudul}#${option.text}](/dashboard/sops/${option.sopId}#${option.id})`;
    }
    
    const newText = textBefore + tag + " " + textAfter;
    onChangeValue(newText);
    setQuery(null);
    setCursorIdx(null);
    
    // Set focus back and cursor position after the inserted tag
    setTimeout(() => {
      if (internalRef.current) {
        internalRef.current.focus();
        const newPos = textBefore.length + tag.length + 1;
        internalRef.current.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (query !== null && options.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % options.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + options.length) % options.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        insertTag(options[activeIndex]);
      } else if (e.key === "Escape") {
        setQuery(null);
        setCursorIdx(null);
      }
    } else {
      if (e.key === "Enter" && !e.shiftKey && onEnter) {
        e.preventDefault();
        onEnter();
      }
    }
  };

  return (
    <div className={styles.container}>
      <textarea
        {...props}
        ref={internalRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      
      {query !== null && options.length > 0 && (
        <div className={styles.popover}>
          {options.map((opt, i) => (
            <div
              key={opt.type + opt.id}
              className={`${styles.option} ${i === activeIndex ? styles.active : ""}`}
              onClick={() => insertTag(opt)}
            >
              {opt.type === "sop" ? (
                <span className={styles.sopTitle}>📄 {opt.text}</span>
              ) : (
                <span className={styles.headingTitle}>↪ {opt.text} <small>({opt.sopJudul})</small></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default TextareaTagger;
