'use client';

import { useEffect } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Heading2,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Redo2,
  UnderlineIcon,
  Undo2,
} from 'lucide-react';
import type { RichTextDocument } from '@/hooks/use-education';
import { useTranslations } from 'next-intl';

const EducationImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      media_id: { default: '' },
      required: { default: false },
    };
  },
});
const educationMediaNode = (name: 'video' | 'pdf') =>
  Node.create({
    name,
    group: 'block',
    atom: true,
    addAttributes() {
      return {
        media_id: { default: '' },
        alt: { default: '' },
        required: { default: false },
      };
    },
    parseHTML() {
      return [{ tag: `div[data-education-${name}]` }];
    },
    renderHTML({ HTMLAttributes }) {
      return [
        'div',
        mergeAttributes(HTMLAttributes, { [`data-education-${name}`]: '' }),
        name === 'video' ? 'Video' : 'PDF',
      ];
    },
  });

function ToolbarButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex size-9 items-center justify-center rounded-lg outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-600/30 ${active ? 'bg-blue-100 text-blue-800' : 'text-navy'}`}
    >
      {children}
    </button>
  );
}

export interface EditorMediaSelection {
  id: string;
  type: 'image' | 'video' | 'pdf';
  alt: string;
  required: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  onRequestMedia,
}: {
  value: RichTextDocument;
  onChange: (document: RichTextDocument) => void;
  onRequestMedia: () => Promise<EditorMediaSelection | null>;
}) {
  const t = useTranslations('adminPage');
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      EducationImage,
      educationMediaNode('video'),
      educationMediaNode('pdf'),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none min-h-56 px-4 py-4 outline-none prose-headings:text-navy prose-a:text-blue-700',
      },
    },
    onUpdate: ({ editor: current }) =>
      onChange(current.getJSON() as RichTextDocument),
  });
  useEffect(() => {
    if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(value))
      editor.commands.setContent(value);
  }, [editor, value]);
  if (!editor)
    return <div className="bg-muted min-h-64 animate-pulse rounded-xl" />;
  return (
    <div className="border-input bg-card overflow-hidden rounded-xl border focus-within:ring-2 focus-within:ring-blue-600/20">
      <div className="border-border bg-muted/60 flex flex-wrap gap-1 border-b p-2">
        <ToolbarButton
          label={t('editorUndo')}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('editorRedo')}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('editorHeading')}
          active={editor.isActive('heading', { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('editorBold')}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('editorItalic')}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('editorUnderline')}
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('editorBulletList')}
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('editorOrderedList')}
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <span className="bg-border mx-1 w-px" />
        <ToolbarButton
          label={t('editorAddMedia')}
          onClick={() =>
            void onRequestMedia().then((media) => {
              if (!media) return;
              const attrs = {
                media_id: media.id,
                alt: media.alt,
                required: media.required,
                src: `education-media:${media.id}`,
              };
              if (media.type === 'image')
                editor.chain().focus().setImage(attrs).run();
              else
                editor
                  .chain()
                  .focus()
                  .insertContent({ type: media.type, attrs })
                  .run();
            })
          }
        >
          <ImageIcon className="size-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
