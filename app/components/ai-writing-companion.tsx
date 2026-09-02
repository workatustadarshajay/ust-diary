"use client";

import { useState } from "react";
import { Bot, Check, Copy, LoaderCircle, MessageCircle, Sparkles, X } from "lucide-react";
import type { Editor } from "@tiptap/react";
import { diaryTemplateMap } from "@/lib/templates";

type Action = "start" | "guided" | "diary-entry" | "expand" | "improve" | "organize" | "create-template" | "convert-template" | "recommend-template";
type Props = { editor: Editor | null; onSaveTemplate: (template: { name: string; description: string; category: string; content: string }) => void; onGuidedWriting: () => void };

const actions: { id: Action; label: string }[] = [
  { id: "start", label: "Help me start" },
  { id: "guided", label: "Guided writing" },
  { id: "diary-entry", label: "Turn notes into diary" },
  { id: "expand", label: "Expand writing" },
  { id: "improve", label: "Improve selection" },
  { id: "organize", label: "Organize my notes" },
  { id: "create-template", label: "Create a template" },
  { id: "convert-template", label: "Convert entry to template" },
  { id: "recommend-template", label: "Recommend a template" },
];

export default function AIWritingCompanion({ editor, onSaveTemplate, onGuidedWriting }: Props) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [instruction, setInstruction] = useState("");

  const runAction = async (nextAction: Action) => {
    if (!editor) return;
    setAction(nextAction); setLoading(true); setError(""); setResult("");
    const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, "\n");
    const text = selected || editor.getText() || instruction;
    const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: nextAction, text, instruction }) });
    const data = await response.json() as { result?: string; error?: string };
    if (!response.ok) setError(data.error ?? "AI request failed"); else setResult(data.result ?? "");
    setLoading(false);
  };

  const accept = () => {
    if (!editor || !result) return;
    if (action === "create-template" || action === "convert-template") {
      try { const template = JSON.parse(result.replace(/^```json\s*|\s*```$/g, "")) as { name: string; description: string; category: string; content: string }; onSaveTemplate(template); } catch { setError("The template preview was not valid. Try again."); }
      return;
    }
    if (action === "recommend-template") {
      try { const recommendation = JSON.parse(result.replace(/^```json\s*|\s*```$/g, "")) as { templateId: string; reason: string }; setResult(`${diaryTemplateMap[recommendation.templateId]?.name ?? recommendation.templateId}\n\n${recommendation.reason}`); } catch { setError("The recommendation preview was not valid. Try again."); }
      return;
    }
    const from = editor.state.selection.from;
    const to = editor.state.selection.to;
    editor.chain().focus().insertContentAt({ from, to }, action === "organize" ? result : result.replace(/^\d+\.\s/gm, "")).run();
    setResult("");
  };

  return <><button type="button" className="ai-launcher" onClick={() => setOpen(true)}><Sparkles size={16} /> AI Help</button>{open && <aside className="ai-panel"><header><div><p className="eyebrow">Writing companion</p><h2><Bot size={19} /> Help me write</h2></div><button type="button" className="icon-button" aria-label="Close AI Help" onClick={() => setOpen(false)}><X size={16} /></button></header><p className="ai-privacy">Only the current entry, selected text, or notes in this box are sent for this request.</p><textarea aria-label="AI instruction or casual notes" placeholder="Write casual notes here, or tell AI what you need..." value={instruction} onChange={(event) => setInstruction(event.target.value)} /><button type="button" className="guided-launcher" onClick={() => { setOpen(false); onGuidedWriting(); }}><MessageCircle size={15} /> Guided writing</button><div className="ai-actions">{actions.map((item) => <button type="button" key={item.id} onClick={() => void runAction(item.id)}>{item.label}</button>)}</div>{loading && <div className="ai-loading"><LoaderCircle className="animate-spin" size={16} /> Thinking...</div>}{error && <p className="ai-error">{error}</p>}{result && <div className="ai-result"><div className="ai-result-header"><span>Preview</span><button type="button" title="Copy preview" aria-label="Copy preview" onClick={() => void navigator.clipboard.writeText(result)}><Copy size={14} /></button></div><pre>{result}</pre><div className="ai-result-actions"><button type="button" className="button button-ghost" onClick={() => { setResult(""); setAction(null); }}><X size={15} /> Reject</button><button type="button" className="button button-primary" onClick={accept}><Check size={15} /> Accept</button></div></div>}</aside>}</>;
}
