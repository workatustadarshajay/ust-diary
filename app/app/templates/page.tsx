"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { diaryTemplates, type DiaryTemplate } from "@/lib/templates";

type CustomTemplate = DiaryTemplate & { id: string };
const storageKey = "ust-diary-custom-templates";

function loadTemplates(): CustomTemplate[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as CustomTemplate[];
}

export default function TemplatesPage() {
  const [custom, setCustom] = useState<CustomTemplate[]>(loadTemplates);
  const [editing, setEditing] = useState<CustomTemplate | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "Personal", content: "<h2>What would you like to reflect on?</h2><p></p>" });
  const save = (next: CustomTemplate[]) => { setCustom(next); window.localStorage.setItem(storageKey, JSON.stringify(next)); };
  const openCreate = () => { setEditing({ id: `custom-${Date.now()}`, ...form }); };
  const openEdit = (template: CustomTemplate) => { setEditing(template); setForm(template); };
  const submit = () => { if (!editing || !form.name.trim()) return; save([...custom.filter((item) => item.id !== editing.id), { ...editing, ...form, name: form.name.trim() }]); setEditing(null); setForm({ name: "", description: "", category: "Personal", content: "<h2>What would you like to reflect on?</h2><p></p>" }); };
  const remove = (id: string) => { if (window.confirm("Delete this custom template?")) save(custom.filter((item) => item.id !== id)); };
  const duplicate = (template: CustomTemplate) => save([...custom, { ...template, id: `custom-${Date.now()}`, name: `${template.name} copy` }]);
  const grouped = [...diaryTemplates, ...custom].reduce<Record<string, DiaryTemplate[]>>((groups, template) => { (groups[template.category] ??= []).push(template); return groups; }, {});

  return <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 lg:py-12"><div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Your library</p><h1 className="display-title mt-3 text-6xl">Templates that fit.</h1><p className="mt-3 max-w-lg text-[var(--ink-muted)]">Keep a few reliable shapes nearby for the days when starting is the hardest part.</p></div><button type="button" className="button button-primary" onClick={openCreate}><Plus size={16} /> New template</button></div>{Object.entries(grouped).map(([category, items]) => <section className="template-section" key={category}><div className="template-section-title"><h2>{category}</h2><span>{items.length} templates</span></div><div className="template-manager-grid">{items.map((template) => <article className="manager-card" key={template.id}><span className="template-category">{template.category}</span><h3>{template.name}</h3><p>{template.description}</p><div className="manager-actions"><Link className="button button-primary" href={`/day/${new Date().toISOString().slice(0, 10)}`}><Plus size={14} /> Use</Link>{template.id.startsWith("custom-") && <><button type="button" className="icon-button" title="Edit template" aria-label="Edit template" onClick={() => openEdit(template as CustomTemplate)}><Pencil size={15} /></button><button type="button" className="icon-button" title="Duplicate template" aria-label="Duplicate template" onClick={() => duplicate(template as CustomTemplate)}><Copy size={15} /></button><button type="button" className="icon-button" title="Delete template" aria-label="Delete template" onClick={() => remove(template.id)}><Trash2 size={15} /></button></>}</div></article>)}</div></section>)}{editing && <div className="template-modal-backdrop"><section className="template-modal paper-panel"><div className="flex items-start justify-between"><div><p className="eyebrow">Custom template</p><h2 className="mt-1 font-serif text-3xl text-[var(--ink)]">Shape your page.</h2></div><button type="button" className="button button-ghost" onClick={() => setEditing(null)}>Close</button></div><div className="template-form"><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Morning check-in" /></label><label>Description<input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What is this template for?" /></label><label>Category<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Personal, Work, Learning..." /></label><label>HTML questions<textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></label></div><div className="flex justify-end gap-2"><button type="button" className="button button-ghost" onClick={() => setEditing(null)}>Cancel</button><button type="button" className="button button-primary" onClick={submit}>Save template</button></div></section></div>}</main>;
}
