import React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

const CalloutComponent = ({ node, updateAttributes }: any) => {
  const type = node.attrs.type || 'info'; // info, warning, success, error

  const config: Record<string, { icon: string, bg: string, border: string, color: string }> = {
    info: { icon: '💡', bg: '#eff6ff', border: '#bfdbfe', color: '#1e3a8a' },
    warning: { icon: '⚠️', bg: '#fffbeb', border: '#fde68a', color: '#92400e' },
    success: { icon: '✅', bg: '#f0fdf4', border: '#bbf7d0', color: '#166534' },
    error: { icon: '🚨', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
  };

  const current = config[type] || config.info;

  return (
    <NodeViewWrapper 
      className={`callout-block type-${type}`} 
      style={{
        display: 'flex',
        gap: '12px',
        padding: '16px',
        margin: '16px 0',
        background: current.bg,
        border: `1px solid ${current.border}`,
        borderRadius: '8px',
        color: current.color,
      }}
    >
      <div 
        contentEditable={false} 
        style={{ fontSize: '20px', userSelect: 'none', cursor: 'pointer' }}
        onClick={() => {
          // Cycle through types on click
          const types = Object.keys(config);
          const nextIndex = (types.indexOf(type) + 1) % types.length;
          updateAttributes({ type: types[nextIndex] });
        }}
        title="Klik untuk mengganti tipe peringatan"
      >
        {current.icon}
      </div>
      <NodeViewContent className="callout-content" style={{ flex: 1, marginTop: '2px' }} />
    </NodeViewWrapper>
  );
};

export const CalloutNode = Node.create({
  name: 'calloutBlock',
  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      type: { default: 'info' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout-block' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent);
  },
});
