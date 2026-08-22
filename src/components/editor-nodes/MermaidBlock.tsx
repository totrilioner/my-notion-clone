import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import dynamic from 'next/dynamic';

const mermaidStr = `
graph TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Debug]
    D --> B
`;

export const MermaidBlock = ({ node, updateAttributes }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState(node.attrs.code || mermaidStr);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isEditing && containerRef.current) {
      import('mermaid').then((mermaid) => {
        mermaid.default.initialize({ startOnLoad: false, theme: 'default' });
        mermaid.default.render('mermaid-svg-' + Math.random().toString(36).substring(7), code)
          .then((result) => {
            if (containerRef.current) {
              containerRef.current.innerHTML = result.svg;
            }
          })
          .catch((e) => {
             if (containerRef.current) {
                containerRef.current.innerHTML = `<div style="color:red; padding: 10px;">Mermaid Error: ${e.message}</div>`;
             }
          });
      });
    }
  }, [code, isEditing]);

  return (
    <NodeViewWrapper className="mermaid-block" style={{ border: '1px solid #eaeaea', borderRadius: '8px', padding: '16px', margin: '16px 0', background: '#fafafa' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>Flowchart / Mind Map (Mermaid)</span>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          style={{ background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', padding: '4px 8px', cursor: 'pointer' }}
        >
          {isEditing ? 'View Diagram' : 'Edit Code'}
        </button>
      </div>

      {isEditing ? (
        <textarea 
          value={code} 
          onChange={(e) => {
            setCode(e.target.value);
            updateAttributes({ code: e.target.value });
          }}
          style={{ width: '100%', minHeight: '150px', fontFamily: 'monospace', fontSize: '13px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      ) : (
        <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', minHeight: '100px' }}>
          {/* SVG will be rendered here */}
        </div>
      )}
    </NodeViewWrapper>
  );
};

import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

export const MermaidNode = Node.create({
  name: 'mermaidBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      code: { default: mermaidStr },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="mermaid-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'mermaid-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidBlock);
  },
});
