import React, { useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

export const PageLinkBlock = ({ node, updateAttributes }: any) => {
  const [isEditing, setIsEditing] = useState(!node.attrs.sopId);
  const [sopId, setSopId] = useState(node.attrs.sopId || '');
  const [title, setTitle] = useState(node.attrs.title || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title) return;
    setIsSaving(true);
    
    try {
      // Create new sub-page
      const res = await fetch('/api/sops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: title,
          contentHtml: '<p>Mulai menulis sub-halaman di sini...</p>',
          // If we had the parent ID we'd send it, but the backend doesn't handle parentId yet.
        })
      });
      const data = await res.json();
      const newId = data.id || ('new-' + Date.now());
      
      setSopId(newId);
      updateAttributes({ sopId: newId, title });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      updateAttributes({ sopId: 'new-' + Date.now(), title });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <NodeViewWrapper className="page-link-block" style={{ margin: '8px 0' }}>
      {isEditing ? (
        <div style={{ display: 'flex', gap: '8px', padding: '12px', border: '1px solid #eaeaea', borderRadius: '8px', background: '#fafafa' }}>
          <input 
            type="text" 
            placeholder="Judul Sub-Halaman..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            disabled={isSaving}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
          />
          <button 
            onClick={handleSave}
            disabled={isSaving}
            style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? 'Membuat...' : 'Buat Halaman'}
          </button>
        </div>
      ) : (
        <a 
          href={`/dashboard/sops/${sopId}`}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 12px', 
            border: '1px solid #eaeaea', 
            borderRadius: '6px', 
            background: '#fff', 
            color: '#111', 
            textDecoration: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
          onClick={(e) => {
            // Kita ingin membiarkan navigasi terjadi di tab yang sama.
            // Jika user menahan ctrl/cmd, biarkan default (buka tab baru)
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              window.location.href = `/dashboard/sops/${sopId}`;
            }
          }}
        >
          <span style={{ color: '#666' }}>📄</span>
          {title}
        </a>
      )}
    </NodeViewWrapper>
  );
};

import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

export const PageLinkNode = Node.create({
  name: 'pageLinkBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      sopId: { default: null },
      title: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="page-link-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'page-link-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageLinkBlock);
  },
});
