"use client";

import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
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

type Props = { editor: Editor | null; onSearch: () => void; onFocus: () => void; onLink: () => void };

type ToolProps = { label: string; active?: boolean; onClick: () => void; children: React.ReactNode };

function Tool({ label, active, onClick, children }: ToolProps) {
  return <button type="button" aria-label={label} title={label} className={`editor-tool ${active ? "editor-tool-active" : ""}`} onClick={onClick}>{children}</button>;
}

const textColors = ["#28251f", "#b33a3a", "#b95f3c", "#2f7660", "#32658f", "#73518c"];
const highlightColors = ["#f4d27a", "#f6b6ad", "#f8c98b", "#bfe1c9", "#b9d9ef", "#d8c6ed"];

export default function EditorToolbar({ editor, onSearch, onFocus, onLink }: Props) {
  if (!editor) return null;
  const run = (action: () => void) => { action(); };
  return (
    <div className="editor-toolbar">
      <Tool label="Undo" onClick={() => run(() => editor.chain().focus().undo().run())}><Undo2 size={16} /></Tool>
      <Tool label="Redo" onClick={() => run(() => editor.chain().focus().redo().run())}><Redo2 size={16} /></Tool>
      <span className="toolbar-divider" />
      <select aria-label="Paragraph style" className="editor-select" value={editor.isActive("heading", { level: 1 }) ? "h1" : editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : "p"} onChange={(event) => { const value = event.target.value; if (value === "p") editor.chain().focus().setParagraph().run(); else editor.chain().focus().toggleHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 }).run(); }}>
        <option value="p">Paragraph</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option>
      </select>
      <Tool label="Bold" active={editor.isActive("bold")} onClick={() => run(() => editor.chain().focus().toggleBold().run())}><Bold size={16} /></Tool>
      <Tool label="Italic" active={editor.isActive("italic")} onClick={() => run(() => editor.chain().focus().toggleItalic().run())}><Italic size={16} /></Tool>
      <Tool label="Underline" active={editor.isActive("underline")} onClick={() => run(() => editor.chain().focus().toggleUnderline().run())}><Underline size={16} /></Tool>
      <Tool label="Strikethrough" active={editor.isActive("strike")} onClick={() => run(() => editor.chain().focus().toggleStrike().run())}><Strikethrough size={16} /></Tool>
      <Tool label="Highlight" active={editor.isActive("highlight")} onClick={() => run(() => editor.chain().focus().toggleHighlight({ color: "#f4d27a" }).run())}><Highlighter size={16} /></Tool>
      <div className="swatch-group" aria-label="Text colors">{textColors.map((color) => <button key={color} type="button" title={`Text color ${color}`} className="color-swatch" style={{ backgroundColor: color }} onClick={() => editor.chain().focus().setColor(color).run()} />)}</div>
      <div className="swatch-group" aria-label="Highlight colors">{highlightColors.map((color) => <button key={color} type="button" title={`Highlight ${color}`} className="color-swatch" style={{ backgroundColor: color }} onClick={() => editor.chain().focus().toggleHighlight({ color }).run()} />)}</div>
      <select aria-label="Font size" className="editor-select editor-size-select" defaultValue="" onChange={(event) => { if (event.target.value) editor.chain().focus().setMark("textStyle", { fontSize: event.target.value }).run(); }}><option value="">Size</option><option value="14px">Small</option><option value="17px">Normal</option><option value="22px">Large</option><option value="30px">XL</option></select>
      <span className="toolbar-divider" />
      <Tool label="Bullet list" active={editor.isActive("bulletList")} onClick={() => run(() => editor.chain().focus().toggleBulletList().run())}><List size={17} /></Tool>
      <Tool label="Numbered list" active={editor.isActive("orderedList")} onClick={() => run(() => editor.chain().focus().toggleOrderedList().run())}><ListOrdered size={17} /></Tool>
      <Tool label="Checklist" active={editor.isActive("taskList")} onClick={() => run(() => editor.chain().focus().toggleTaskList().run())}><List size={17} /></Tool>
      <Tool label="Quote" active={editor.isActive("blockquote")} onClick={() => run(() => editor.chain().focus().toggleBlockquote().run())}><Quote size={16} /></Tool>
      <Tool label="Code block" active={editor.isActive("codeBlock")} onClick={() => run(() => editor.chain().focus().toggleCodeBlock().run())}><Code size={16} /></Tool>
      <span className="toolbar-divider" />
      <Tool label="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => run(() => editor.chain().focus().setTextAlign("left").run())}><AlignLeft size={16} /></Tool>
      <Tool label="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => run(() => editor.chain().focus().setTextAlign("center").run())}><AlignCenter size={16} /></Tool>
      <Tool label="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => run(() => editor.chain().focus().setTextAlign("right").run())}><AlignRight size={16} /></Tool>
      <Tool label="Insert table" onClick={() => run(() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}><Table2 size={16} /></Tool>
      <Tool label="Horizontal rule" onClick={() => run(() => editor.chain().focus().setHorizontalRule().run())}><Minus size={16} /></Tool>
      <Tool label="Clear formatting" onClick={() => run(() => editor.chain().focus().clearNodes().unsetAllMarks().run())}><RemoveFormatting size={16} /></Tool>
      <span className="toolbar-divider" />
      <button type="button" className="toolbar-text-button" onClick={onSearch}>Find</button>
      <button type="button" className="toolbar-text-button" onClick={onLink}>Link</button>
      <button type="button" className="toolbar-text-button" onClick={onFocus}>Focus</button>
    </div>
  );
}
