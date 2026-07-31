'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Bold, Heading2, ImageIcon, Italic, List, ListOrdered, Quote, Redo2, Undo2 } from 'lucide-react';
import type { JournalDocument } from '@/hooks/use-daily-journal';

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 1024 * 1024;

function ToolButton({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return <button type="button" aria-label={label} title={label} aria-pressed={active} onClick={onClick} className={`flex size-9 items-center justify-center rounded-lg outline-none hover:bg-azure/60 focus-visible:ring-2 focus-visible:ring-ring/30 ${active ? 'bg-azure text-navy' : 'text-navy'}`}>{children}</button>;
}

export function JournalTextEditor({ value, onChange, labels }: { value: JournalDocument; onChange: (document: JournalDocument) => void; labels: Record<string, string> }) {
  const input = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } }), Image],
    content: value,
    editorProps: { attributes: { class: 'prose prose-slate max-w-none min-h-56 px-4 py-4 outline-none prose-headings:text-navy prose-img:rounded-xl prose-img:border prose-img:border-border' } },
    onUpdate: ({ editor: current }) => onChange(current.getJSON() as JournalDocument),
  });
  useEffect(() => {
    if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) editor.commands.setContent(value);
  }, [editor, value]);
  if (!editor) return <div className="bg-muted min-h-64 animate-pulse rounded-xl" />;
  const chooseImage = () => input.current?.click();
  const insertImage = (file?: File) => {
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > MAX_IMAGE_BYTES) return;
    const count = (editor.getJSON().content || []).filter((node: { type?: string }) => node.type === 'image').length;
    if (count >= MAX_IMAGES) return;
    const reader = new FileReader();
    reader.onload = () => editor.chain().focus().setImage({ src: String(reader.result), alt: file.name }).run();
    reader.readAsDataURL(file);
  };
  return <div className="border-input bg-card overflow-hidden rounded-xl border focus-within:ring-2 focus-within:ring-ring/30">
    <div className="border-border bg-muted/60 flex flex-wrap gap-1 border-b p-2">
      <ToolButton label={labels.undo} onClick={() => editor.chain().focus().undo().run()}><Undo2 className="size-4" /></ToolButton>
      <ToolButton label={labels.redo} onClick={() => editor.chain().focus().redo().run()}><Redo2 className="size-4" /></ToolButton>
      <ToolButton label={labels.heading} active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="size-4" /></ToolButton>
      <ToolButton label={labels.bold} active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="size-4" /></ToolButton>
      <ToolButton label={labels.italic} active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="size-4" /></ToolButton>
      <ToolButton label={labels.bulletList} active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="size-4" /></ToolButton>
      <ToolButton label={labels.orderedList} active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="size-4" /></ToolButton>
      <ToolButton label={labels.quote} active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="size-4" /></ToolButton>
      <ToolButton label={labels.image} onClick={chooseImage}><ImageIcon className="size-4" /></ToolButton>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { insertImage(event.target.files?.[0]); event.target.value = ''; }} />
    </div>
    <div className="relative">
      <EditorContent editor={editor} />
      {editor.isEmpty ? <p className="text-muted-foreground pointer-events-none absolute top-4 left-4 text-sm">{labels.placeholder}</p> : null}
    </div>
  </div>;
}
