"use client";

import { useEffect, useMemo, useState } from "react";
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
import { ArrowLeft, BookOpen, Check, Eye, Expand, History, LoaderCircle, Minimize2, Save, Search } from "lucide-react";
import EditorToolbar from "@/components/editor-toolbar";
import { useDiaryEntry } from "@/hooks/use-diary-entry";
import { formatHeadingDate, fromDateKey } from "@/lib/dates";
import { diaryTemplates, diaryTemplateMap } from "@/lib/templates";

export default function DayEditorPage() {
  const params = useParams<{ date: string }>();
  const date = params.date;
  const parsedDate = fromDateKey(date);
  const { content, updateContent, metadata, updateMetadata, versions, save, saveState, error, lastSavedAt } = useDiaryEntry(date);
  const [focusMode, setFocusMode] = useState(false);
  const [theme, setTheme] = useState<"light" | "sepia" | "dark">("light");
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const prompts = ["What made today meaningful?", "What challenged you today?", "What are you grateful for?"];

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
  const characterCount = editor?.getText().length ?? 0;

  const insertLink = () => {
    const href = window.prompt("Paste a link URL");
    if (href) editor?.chain().focus().setLink({ href }).run();
  };

  const searchAndReplace = () => {
    if (!query) return;
    const text = editor?.getText() ?? "";
    const matches = text.split(query).length - 1;
    const next = window.prompt(`${matches} match${matches === 1 ? "" : "es"} found. Replace with:`, replacement);
    if (next === null || !editor) return;
    const html = editor.getHTML().split(query).join(next);
    editor.commands.setContent(html);
  };

  const applyTemplate = (templateId: string) => {
    const template = diaryTemplateMap[templateId];
    if (!template || !editor) return;
    if (editor.getText().trim() && !window.confirm("This will replace the current page content. Continue?")) return;
    editor.commands.setContent(template.content);
    updateMetadata({ ...metadata, template: template.id });
    setShowTemplates(false);
  };

  if (!parsedDate) {
    return <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-16"><p className="eyebrow">Page not found</p><h1 className="display-title mt-4 text-5xl">That date is not valid.</h1><Link className="button button-primary mt-8 w-fit" href="/">Back to calendar</Link></main>;
  }

  return (
    <main className={`mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-6 sm:px-8 lg:py-10 ${focusMode ? "focus-mode" : ""}`} data-theme={theme}>
      <header className="mb-7 flex items-center justify-between gap-4">
        <Link className="button button-ghost" href="/"><ArrowLeft size={16} /> Calendar</Link>
        <Link className="button button-ghost" href={`/book/${date}`}><BookOpen size={16} /> Read page</Link>
      </header>
      <div className="mb-6">
        <p className="eyebrow">Daily page</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-[var(--ink)] sm:text-5xl">{formatHeadingDate(parsedDate)}</h1>
        <button type="button" className="template-launcher" onClick={() => setShowTemplates((value) => !value)}><BookOpen size={15} /> Choose a template</button>
      </div>
      {showTemplates && <section className="template-panel paper-panel"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Reusable pages</p><h2 className="mt-1 font-serif text-3xl font-semibold text-[var(--ink)]">Start with a shape.</h2></div><button type="button" className="button button-ghost" onClick={() => setShowTemplates(false)}>Close</button></div><div className="template-grid">{diaryTemplates.map((template) => <button type="button" className="template-card" key={template.id} onClick={() => applyTemplate(template.id)}><span className="template-category">{template.category}</span><strong>{template.name}</strong><small>{template.description}</small><span className="template-use">Use template <ArrowLeft size={13} /></span></button>)}</div></section>}
      <section className="paper-panel overflow-hidden">
        <div className="editor-options" data-theme={theme}>
          <span className="editor-option-label"><Eye size={14} /> Reading tone</span>
          {(["light", "sepia", "dark"] as const).map((value) => <button key={value} type="button" className={`mode-button ${theme === value ? "mode-button-active" : ""}`} onClick={() => setTheme(value)}>{value}</button>)}
          <button type="button" className="mode-button mode-button-spacer" onClick={() => setFocusMode((value) => !value)}>{focusMode ? <Minimize2 size={14} /> : <Expand size={14} />} {focusMode ? "Exit focus" : "Focus mode"}</button>
        </div>
        <div className="diary-meta-panel">
          <label className="meta-field"><span>Mood</span><select value={metadata.mood ?? ""} onChange={(event) => updateMetadata({ ...metadata, mood: event.target.value || null })}><option value="">Choose mood</option><option>Joyful</option><option>Calm</option><option>Focused</option><option>Tired</option><option>Heavy</option></select></label>
          <label className="meta-field meta-field-wide"><span>Tags</span><input value={tagInput} placeholder="Add a tag and press Enter" onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && tagInput.trim()) { event.preventDefault(); updateMetadata({ ...metadata, tags: [...new Set([...metadata.tags, tagInput.trim()])] }); setTagInput(""); } }} /><small>{metadata.tags.join(" · ") || "No tags yet"}</small></label>
          <label className="meta-field"><span>Prompt</span><select value={metadata.prompt ?? ""} onChange={(event) => updateMetadata({ ...metadata, prompt: event.target.value || null })}><option value="">No prompt</option>{prompts.map((prompt) => <option key={prompt}>{prompt}</option>)}</select></label>
            <label className="meta-field"><span>Template</span><button type="button" className="meta-select-button" onClick={() => setShowTemplates(true)}>{diaryTemplateMap[metadata.template ?? "blank"]?.name ?? "Blank page"}</button></label>
        </div>
        <EditorToolbar editor={editor} onSearch={() => { const next = window.prompt("Find text", query); if (next !== null) setQuery(next); }} onFocus={() => setFocusMode((value) => !value)} onLink={insertLink} />
        <div className="editor-wrap">
          {saveState === "loading" ? <div className="editor-loading">Opening your page...</div> : <EditorContent editor={editor} />}
        </div>
        <div className="search-panel">
          <Search size={15} /><input aria-label="Find text" placeholder="Find text" value={query} onChange={(event) => setQuery(event.target.value)} /><input aria-label="Replace with" placeholder="Replace with" value={replacement} onChange={(event) => setReplacement(event.target.value)} /><button type="button" className="button button-ghost" onClick={searchAndReplace}>Replace all</button>
        </div>
        {versions.length > 0 && <details className="history-panel"><summary><History size={15} /> Version history ({versions.length})</summary><div className="history-list">{versions.map((version) => <button type="button" key={version.id} onClick={() => editor?.commands.setContent(version.content)}><span>{new Date(version.created_at).toLocaleString()}</span><small>Restore</small></button>)}</div></details>}
        {error && <p className="border-t border-[var(--line)] bg-red-50 px-6 py-3 text-sm text-red-800">{error}</p>}
        <footer className="editor-footer">
          <span>{wordCount} {wordCount === 1 ? "word" : "words"} · {characterCount} characters</span>
          <span className="save-state">
            {saveState === "saving" && <LoaderCircle className="animate-spin" size={15} />}
            {saveState === "saved" && <Check size={15} />}
            {saveState === "loading" ? "Loading" : saveState === "saving" ? "Saving" : saveState === "error" ? "Try again" : lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Saved"}
          </span>
          <button className="button button-primary" disabled={saveState === "loading" || saveState === "saving"} onClick={() => void save()}><Save size={16} /> Save</button>
        </footer>
      </section>
      <p className="mt-4 text-center text-xs text-[var(--ink-faint)]">Your page saves automatically while you write.</p>
    </main>
  );
}
