import React, { useState, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

// Using dynamic import so tldraw isn't bundled on initial load
import dynamic from 'next/dynamic';

const Tldraw = dynamic(() => import('tldraw').then(mod => mod.Tldraw), {
  ssr: false,
  loading: () => <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>Memuat Whiteboard (Tldraw)...</div>
});

const WhiteboardComponent = ({ node, updateAttributes }: any) => {
  const [snapshot, setSnapshot] = useState(node.attrs.snapshot);
  
  // A ref or state to track if we're currently in fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <NodeViewWrapper className="whiteboard-block" style={{ margin: '24px 0' }}>
      <div 
        style={{
          border: '1px solid #e2e8f0', 
          borderRadius: '12px', 
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          right: isFullscreen ? 0 : 'auto',
          bottom: isFullscreen ? 0 : 'auto',
          width: isFullscreen ? '100vw' : '100%',
          height: isFullscreen ? '100vh' : '500px',
          zIndex: isFullscreen ? 9999 : 1,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>🎨 Whiteboard (Tldraw)</span>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
          >
            {isFullscreen ? 'Tutup Fullscreen' : 'Layar Penuh (Edit Bebas)'}
          </button>
        </div>
        
        <div style={{ position: 'relative', width: '100%', height: isFullscreen ? 'calc(100vh - 45px)' : 'calc(100% - 45px)' }}>
          <Tldraw
            // If there's an existing snapshot, we could load it here, but Tldraw handles persistence differently.
            // For now, we will just mount a fresh instance. Advanced implementations would use `store`.
            persistenceKey={node.attrs.boardId || `board-${Date.now()}`}
            className="tldraw-canvas"
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const WhiteboardNode = Node.create({
  name: 'whiteboardBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      snapshot: { default: null },
      boardId: { 
        default: null,
        parseHTML: element => element.getAttribute('data-board-id'),
        renderHTML: attributes => {
          if (!attributes.boardId) return { 'data-board-id': `board-${Date.now()}` };
          return { 'data-board-id': attributes.boardId };
        },
      }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="whiteboard-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'whiteboard-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(WhiteboardComponent);
  },
});
