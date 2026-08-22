import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { SlashCommandList } from './SlashCommandList';
import { PluginKey } from '@tiptap/pm/state';

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const getSuggestionItems = () => {
  return [
    {
      title: 'Heading 1',
      description: 'Judul Utama Besar',
      icon: 'H1',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      description: 'Judul Sekunder',
      icon: 'H2',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Heading 3',
      description: 'Judul Tersier',
      icon: 'H3',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
      },
    },
    {
      title: 'To-do List',
      description: 'Tugas dengan checkbox',
      icon: '✅',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: 'Bullet List',
      description: 'Daftar sederhana',
      icon: '•',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Callout (Info Box)',
      description: 'Kotak informasi atau peringatan',
      icon: '💡',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('calloutBlock').run();
      },
    },
    {
      title: 'Pembatas Garis (Divider)',
      description: 'Garis pemisah horizontal',
      icon: '➖',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    {
      title: 'Sorot Teks (Highlight)',
      description: 'Beri warna latar pada teks terpilih',
      icon: '🖍️',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleHighlight().run();
      },
    },
    {
      title: 'Flowchart / Mind Map',
      description: 'Buat diagram visual',
      icon: '🔄',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent('<div data-type="mermaid-block"></div>').run();
      },
    },
    {
      title: 'Sub-Page (Halaman)',
      description: 'Tautkan SOP bersarang',
      icon: '📄',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent('<div data-type="page-link-block"></div>').run();
      },
    },
    {
      title: 'Tabel (Bisa Diedit)',
      description: 'Tambahkan tabel yang interaktif',
      icon: '📊',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      },
    },
    {
      title: 'Whiteboard (Kanvas Bebas)',
      description: 'Corat-coret, buat diagram, dan panah bebas',
      icon: '🎨',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent('<div data-type="whiteboard-block"></div>').run();
      },
    },
    {
      title: 'Gambar / Foto',
      description: 'Masukkan link gambar atau URL foto',
      icon: '🖼️',
      command: ({ editor, range }: any) => {
        const url = prompt("Masukkan Link Gambar (atau URL Foto):");
        if (url) {
          editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
        } else {
          editor.chain().focus().deleteRange(range).run();
        }
      },
    },
  ];
};

const pluginKey = new PluginKey('slashCommands');

export const renderItems = () => {
  let component: ReactRenderer<any> | null = null;
  let popup: any | null = null;

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(SlashCommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      });
    },

    onUpdate(props: any) {
      component?.updateProps(props);

      if (!props.clientRect) {
        return;
      }

      popup?.[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },

    onKeyDown(props: any) {
      if (props.event.key === 'Escape') {
        popup?.[0].hide();
        return true;
      }

      return component?.ref?.onKeyDown(props) || false;
    },

    onExit() {
      popup?.[0].destroy();
      component?.destroy();
    },
  };
};
