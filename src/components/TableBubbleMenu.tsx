import React from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';

export const TableBubbleMenu = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }) => {
        return editor.isActive('table');
      }}
      className="table-bubble-menu"
    >
      <div style={{ display: 'flex', gap: '4px', background: '#111', padding: '6px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <button
          onClick={() => editor.chain().focus().addRowBefore().run()}
          style={btnStyle}
          title="Tambah Baris (Atas)"
        >
          ⬆️➕
        </button>
        <button
          onClick={() => editor.chain().focus().addRowAfter().run()}
          style={btnStyle}
          title="Tambah Baris (Bawah)"
        >
          ⬇️➕
        </button>
        <button
          onClick={() => editor.chain().focus().deleteRow().run()}
          style={btnStyle}
          title="Hapus Baris"
        >
          ➖ Baris
        </button>
        <div style={{ width: '1px', background: '#444', margin: '0 4px' }} />
        <button
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          style={btnStyle}
          title="Tambah Kolom (Kiri)"
        >
          ⬅️➕
        </button>
        <button
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          style={btnStyle}
          title="Tambah Kolom (Kanan)"
        >
          ➡️➕
        </button>
        <button
          onClick={() => editor.chain().focus().deleteColumn().run()}
          style={btnStyle}
          title="Hapus Kolom"
        >
          ➖ Kolom
        </button>
        <div style={{ width: '1px', background: '#444', margin: '0 4px' }} />
        <button
          onClick={() => editor.chain().focus().deleteTable().run()}
          style={{ ...btnStyle, color: '#ff4444' }}
          title="Hapus Tabel"
        >
          🗑️ Hapus Tabel
        </button>
      </div>
    </BubbleMenu>
  );
};

const btnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  fontSize: '12px',
  cursor: 'pointer',
  padding: '6px 8px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
