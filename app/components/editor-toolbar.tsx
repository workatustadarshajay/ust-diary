"use client";

import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Table2,
  Underline,
  Undo2,
} from "lucide-react";

type Props = { editor: Editor | null };

type ToolProps = { label: string; active?: boolean; onClick: () => void; children: React.ReactNode };

function Tool({ label, active, onClick, children }: ToolProps) {
  return <button type="button" aria-label={label} title={label} className={`editor-tool ${active ? "editor-tool-active" : ""}`} onClick={onClick}>{children}</button>;
}

export default function EditorToolbar({ editor }: Props) {
  if (!editor) return null;
  const run = (action: () => void) => { action(); };
  return (
    <div className="editor-toolbar">
      <Tool label="Undo" onClick={() => run(() => editor.chain().focus().undo().run())}><Undo2 size={16} /></Tool>
      <Tool label="Redo" onClick={() => run(() => editor.chain().focus().redo().run())}><Redo2 size={16} /></Tool>
      <span className="toolbar-divider" />
      <Tool label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => run(() => editor.chain().focus().toggleHeading({ level: 1 }).run())}><Heading1 size={17} /></Tool>
      <Tool label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => run(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}><Heading2 size={17} /></Tool>
      <Tool label="Bold" active={editor.isActive("bold")} onClick={() => run(() => editor.chain().focus().toggleBold().run())}><Bold size={16} /></Tool>
      <Tool label="Italic" active={editor.isActive("italic")} onClick={() => run(() => editor.chain().focus().toggleItalic().run())}><Italic size={16} /></Tool>
      <Tool label="Underline" active={editor.isActive("underline")} onClick={() => run(() => editor.chain().focus().toggleUnderline().run())}><Underline size={16} /></Tool>
      <Tool label="Strikethrough" active={editor.isActive("strike")} onClick={() => run(() => editor.chain().focus().toggleStrike().run())}><Strikethrough size={16} /></Tool>
      <Tool label="Highlight" active={editor.isActive("highlight")} onClick={() => run(() => editor.chain().focus().toggleHighlight({ color: "#f4d27a" }).run())}><Highlighter size={16} /></Tool>
      <span className="toolbar-divider" />
      <Tool label="Bullet list" active={editor.isActive("bulletList")} onClick={() => run(() => editor.chain().focus().toggleBulletList().run())}><List size={17} /></Tool>
      <Tool label="Numbered list" active={editor.isActive("orderedList")} onClick={() => run(() => editor.chain().focus().toggleOrderedList().run())}><ListOrdered size={17} /></Tool>
      <Tool label="Quote" active={editor.isActive("blockquote")} onClick={() => run(() => editor.chain().focus().toggleBlockquote().run())}><Quote size={16} /></Tool>
      <Tool label="Code block" active={editor.isActive("codeBlock")} onClick={() => run(() => editor.chain().focus().toggleCodeBlock().run())}><Code size={16} /></Tool>
      <span className="toolbar-divider" />
      <Tool label="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => run(() => editor.chain().focus().setTextAlign("left").run())}><AlignLeft size={16} /></Tool>
      <Tool label="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => run(() => editor.chain().focus().setTextAlign("center").run())}><AlignCenter size={16} /></Tool>
      <Tool label="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => run(() => editor.chain().focus().setTextAlign("right").run())}><AlignRight size={16} /></Tool>
      <Tool label="Insert table" onClick={() => run(() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}><Table2 size={16} /></Tool>
      <Tool label="Horizontal rule" onClick={() => run(() => editor.chain().focus().setHorizontalRule().run())}><Minus size={16} /></Tool>
      <Tool label="Clear formatting" onClick={() => run(() => editor.chain().focus().clearNodes().unsetAllMarks().run())}><RemoveFormatting size={16} /></Tool>
    </div>
  );
}
