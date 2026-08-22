import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';

// --- EMBED BLOCK (Canva / YouTube / Sheets) ---
const EmbedComponent = ({ node, updateAttributes }: any) => {
  const url = node.attrs.src;
  
  if (!url) {
    return (
      <NodeViewWrapper className="embed-block-wrapper empty">
        <div contentEditable={false} className="embed-placeholder">
          <input
            autoFocus
            type="url"
            placeholder="Tempel link YouTube, TikTok, IG, atau Canva lalu tekan Enter..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const inputUrl = e.currentTarget.value;
                if (inputUrl) updateAttributes({ src: inputUrl });
              }
            }}
          />
        </div>
      </NodeViewWrapper>
    );
  }

  // Detect basic URL types for iframe
  let finalUrl = url;
  if (url.includes('youtube.com/watch?v=')) {
    finalUrl = url.replace('watch?v=', 'embed/');
  } else if (url.includes('youtu.be/')) {
    finalUrl = url.replace('youtu.be/', 'youtube.com/embed/');
  } else if (url.includes('canva.com/design')) {
    finalUrl = url.endsWith('view') ? url : url + '/view';
  } else if (url.includes('tiktok.com')) {
    const match = url.match(/\/video\/(\d+)/);
    if (match) finalUrl = `https://www.tiktok.com/embed/v2/${match[1]}`;
  } else if (url.includes('instagram.com/p/') || url.includes('instagram.com/reel/')) {
    finalUrl = url.split('?')[0]; 
    if (!finalUrl.endsWith('/')) finalUrl += '/';
    finalUrl += 'embed';
  }

  return (
    <NodeViewWrapper className="embed-block-wrapper">
      <div contentEditable={false} className="embed-iframe-container">
        <iframe src={finalUrl} allowFullScreen loading="lazy" />
        <button className="embed-remove" onClick={() => updateAttributes({ src: null })}>Ganti Link</button>
      </div>
    </NodeViewWrapper>
  );
};

export const EmbedBlock = Node.create({
  name: 'embedBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="embed-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'embed-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedComponent);
  },
});

// --- REMINDER / CALENDAR BLOCK ---
const ReminderComponent = ({ node, updateAttributes }: any) => {
  const date = node.attrs.date;

  return (
    <NodeViewWrapper className="reminder-block-wrapper" as="span">
      <span contentEditable={false} className="reminder-badge">
        <span className="reminder-icon">⏰</span>
        <input 
          type="date" 
          value={date || ''}
          onChange={(e) => updateAttributes({ date: e.target.value })}
        />
        {date && <span className="reminder-text">{new Date(date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>}
      </span>
    </NodeViewWrapper>
  );
};

export const ReminderBlock = Node.create({
  name: 'reminderBlock',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      date: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="reminder-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'reminder-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ReminderComponent);
  },
});
