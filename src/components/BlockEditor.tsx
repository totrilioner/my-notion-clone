"use client";

import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { common, createLowlight } from "lowlight";
import { EmbedBlock, ReminderBlock } from "./EditorNodes";
import { MermaidNode } from "./editor-nodes/MermaidBlock";
import { PageLinkNode } from "./editor-nodes/PageLinkBlock";
import { CalloutNode } from "./editor-nodes/CalloutBlock";
import { WhiteboardNode } from "./editor-nodes/WhiteboardBlock";
import { SlashCommands, getSuggestionItems, renderItems } from "./editor-nodes/slash-extension";
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import styles from "./block-editor.module.css";
import { TableBubbleMenu } from "./TableBubbleMenu";
import { TableOfContents } from "./TableOfContents";
import { tidyUpHtml } from "@/lib/auto-format";

const lowlight = createLowlight(common);

type BlockEditorProps = {
  initialContent?: string;
  onChange?: (html: string) => void;
  disabled?: boolean;
};

export default function BlockEditor({ initialContent = "", onChange, disabled = false }: BlockEditorProps) {
  const [isHoveringPlus, setIsHoveringPlus] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        horizontalRule: false,
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: styles.hrDivider,
        },
      }),
      Highlight.configure({ multicolor: true }),
      CodeBlockLowlight.configure({ lowlight }),
      TiptapLink.configure({ openOnClick: false, autolink: true }),
      TiptapImage.configure({ allowBase64: true }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      EmbedBlock,
      ReminderBlock,
      MermaidNode,
      PageLinkNode,
      CalloutNode,
      WhiteboardNode,
      SlashCommands.configure({
        suggestion: {
          items: ({ query }: { query: string }) => {
            return getSuggestionItems().filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
          },
          render: renderItems,
        },
      }),
      Placeholder.configure({
        placeholder: "Ketik / untuk perintah atau mulai menulis...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: initialContent || '<p></p>',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  const handleTidyUp = () => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const cleaned = tidyUpHtml(currentHtml);
    editor.commands.setContent(cleaned);
  };

  if (!editor) {
    return <div className={styles.editorSkeleton}>Memuat Editor...</div>;
  }

  return (
    <div className={styles.editorContainer}>
      <TableBubbleMenu editor={editor} />
      {/* Bubble Menu for text formatting */}
      <BubbleMenu editor={editor} className={styles.bubbleMenu}>
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? styles.active : ""}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? styles.active : ""}>i</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive("underline") ? styles.active : ""}>U</button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive("strike") ? styles.active : ""}>S</button>
        <div className={styles.divider} />
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive("heading", { level: 2 }) ? styles.active : ""}>H2</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive("heading", { level: 3 }) ? styles.active : ""}>H3</button>
        <div className={styles.divider} />
        <button onClick={() => {
          const url = prompt("Masukkan Link:");
          if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}>🔗</button>
        <button onClick={() => editor.chain().focus().insertContent('<span data-type="reminder-block"></span>').run()}>⏰</button>
      </BubbleMenu>

      {/* Floating Menu for inserting blocks on empty lines */}
      <FloatingMenu editor={editor}>
        <div 
          className={styles.floatingMenuTrigger} 
          onMouseEnter={() => setIsHoveringPlus(true)}
          onMouseLeave={() => setIsHoveringPlus(false)}
        >
          <button className={styles.plusButton}>+</button>
          
          {isHoveringPlus && (
            <div className={styles.floatingMenuDropdown}>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>Heading 1</button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>Heading 2</button>
              <button onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullet List</button>
              <button onClick={() => editor.chain().focus().toggleTaskList().run()}>To-do List</button>
              <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Tabel</button>
              <button onClick={() => editor.chain().focus().insertContent('<div data-type="embed-block"></div>').run()}>Embed Canva / Sheets / Video</button>
            </div>
          )}
        </div>
      </FloatingMenu>

      <div className={styles.editorMain}>
        <div className={styles.editorActions}>
          <button type="button" onClick={handleTidyUp} className={styles.tidyButton} title="Merapikan spasi kosong, list, dan heading yang berantakan">
            ✨ Rapikan Format
          </button>
        </div>
        <EditorContent editor={editor} className={styles.editorContent} />
      </div>
      <TableOfContents editor={editor} />
    </div>
  );
}

const defaultContent = `
<h1>Judul SOP Baru</h1>
<p>Mulailah mengetik prosedur Anda di sini. Gunakan tombol + di sebelah kiri baris kosong untuk menambahkan Tabel, To-do list, atau Embed Dokumen.</p>
`;
