import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import styles from './block-editor.module.css';

interface TableOfContentsProps {
  editor: Editor | null;
}

interface ToCItem {
  id: string;
  text: string;
  level: number;
  originalIndex: number;
}

export function TableOfContents({ editor }: TableOfContentsProps) {
  const [items, setItems] = useState<ToCItem[]>([]);

  useEffect(() => {
    if (!editor) return;

    const updateToC = () => {
      const headings: ToCItem[] = [];
      let headingIndex = 0;
      
      const transaction = editor.state.doc;
      transaction.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          headings.push({
            id: `heading-${headingIndex}`,
            text: node.textContent || '(Tanpa Judul)',
            level: node.attrs.level,
            originalIndex: headingIndex,
          });
          headingIndex++;
        }
      });
      setItems(headings);
    };

    editor.on('update', updateToC);
    updateToC(); // Initial load

    return () => {
      editor.off('update', updateToC);
    };
  }, [editor]);

  const scrollToHeading = (index: number) => {
    const editorDom = document.querySelector('.ProseMirror');
    if (!editorDom) return;
    
    // Find all heading elements
    const headingElements = editorDom.querySelectorAll('h1, h2, h3');
    const targetElement = headingElements[index];
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.tocContainer}>
        <h4 className={styles.tocTitle}>Daftar Isi</h4>
        <p className={styles.tocEmpty}>Tambahkan Heading untuk memunculkan daftar isi.</p>
      </div>
    );
  }

  return (
    <div className={styles.tocContainer}>
      <h4 className={styles.tocTitle}>Daftar Isi</h4>
      <ul className={styles.tocList}>
        {items.map((item, idx) => (
          <li 
            key={idx} 
            className={`${styles.tocItem} ${styles[`tocLevel${item.level}`]}`}
            onClick={() => scrollToHeading(item.originalIndex)}
          >
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
