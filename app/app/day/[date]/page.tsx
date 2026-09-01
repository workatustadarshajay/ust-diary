"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { ArrowLeft, BookOpen, Check, LoaderCircle, Save } from "lucide-react";
import EditorToolbar from "@/components/editor-toolbar";
import { useDiaryEntry } from "@/hooks/use-diary-entry";
import { formatHeadingDate, fromDateKey } from "@/lib/dates";

export default function DayEditorPage() {
  const params = useParams<{ date: string }>();
  const date = params.date;
  const parsedDate = fromDateKey(date);
  const { content, updateContent, save, saveState, error } = useDiaryEntry(date);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => updateContent(currentEditor.getHTML()),
    editorProps: { attributes: { class: "editor-content" } },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) editor.commands.setContent(content, { emitUpdate: false });
  }, [content, editor]);

  const wordCount = useMemo(() => {
    const text = editor?.getText() ?? "";
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [editor]);

  if (!parsedDate) {
    return <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-16"><p className="eyebrow">Page not found</p><h1 className="display-title mt-4 text-5xl">That date is not valid.</h1><Link className="button button-primary mt-8 w-fit" href="/">Back to calendar</Link></main>;
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-6 sm:px-8 lg:py-10">
      <header className="mb-7 flex items-center justify-between gap-4">
        <Link className="button button-ghost" href="/"><ArrowLeft size={16} /> Calendar</Link>
        <Link className="button button-ghost" href={`/book/${date}`}><BookOpen size={16} /> Read page</Link>
      </header>
      <div className="mb-6">
        <p className="eyebrow">Daily page</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-[var(--ink)] sm:text-5xl">{formatHeadingDate(parsedDate)}</h1>
      </div>
      <section className="paper-panel overflow-hidden">
        <EditorToolbar editor={editor} />
        <div className="editor-wrap">
          {saveState === "loading" ? <div className="editor-loading">Opening your page...</div> : <EditorContent editor={editor} />}
        </div>
        {error && <p className="border-t border-[var(--line)] bg-red-50 px-6 py-3 text-sm text-red-800">{error}</p>}
        <footer className="editor-footer">
          <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
          <span className="save-state">
            {saveState === "saving" && <LoaderCircle className="animate-spin" size={15} />}
            {saveState === "saved" && <Check size={15} />}
            {saveState === "loading" ? "Loading" : saveState === "saving" ? "Saving" : saveState === "error" ? "Try again" : "Saved"}
          </span>
          <button className="button button-primary" disabled={saveState === "loading" || saveState === "saving"} onClick={() => void save()}><Save size={16} /> Save</button>
        </footer>
      </section>
      <p className="mt-4 text-center text-xs text-[var(--ink-faint)]">Your page saves automatically while you write.</p>
    </main>
  );
}
