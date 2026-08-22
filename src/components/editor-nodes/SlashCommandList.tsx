import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import styles from '../block-editor.module.css';

interface CommandItem {
  title: string;
  description: string;
  command: ({ editor, range }: any) => void;
  icon?: string;
}

interface SlashCommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

export const SlashCommandList = forwardRef((props: SlashCommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className={styles.slashCommandList}>
      {props.items.length > 0 ? (
        props.items.map((item, index) => (
          <button
            className={`${styles.slashCommandItem} ${index === selectedIndex ? styles.slashCommandItemActive : ''}`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <div className={styles.slashCommandIcon}>{item.icon || '📌'}</div>
            <div className={styles.slashCommandText}>
              <div className={styles.slashCommandTitle}>{item.title}</div>
              <div className={styles.slashCommandDesc}>{item.description}</div>
            </div>
          </button>
        ))
      ) : (
        <div className={styles.slashCommandEmpty}>No results</div>
      )}
    </div>
  );
});

SlashCommandList.displayName = 'SlashCommandList';
