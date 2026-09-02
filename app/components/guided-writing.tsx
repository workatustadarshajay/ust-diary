"use client";

import { useState } from "react";
import { ArrowRight, Check, LoaderCircle, MessageCircle, X } from "lucide-react";
import type { Editor } from "@tiptap/react";

type Props = { editor: Editor | null; onClose: () => void };
type Message = { question: string; answer: string };

const fallbackQuestions = ["What happened today?", "How did it affect you?", "What did you learn?", "What do you want to do tomorrow?"];

export default function GuidedWriting({ editor, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState(fallbackQuestions[0]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  const askAI = async (action: "guided-question" | "guided-entry", text: string) => {
    const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, text }) });
    const data = await response.json() as { result?: string; error?: string };
    if (!response.ok) throw new Error(data.error ?? "AI request failed");
    return data.result ?? "";
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    const nextMessages = [...messages, { question, answer: answer.trim() }];
    setMessages(nextMessages); setAnswer(""); setError("");
    if (nextMessages.length >= 4) {
      setLoading(true);
      try { setPreview(await askAI("guided-entry", nextMessages.map((item) => `${item.question}\n${item.answer}`).join("\n\n"))); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not create the entry"); }
      setLoading(false);
      return;
    }
    setQuestion(fallbackQuestions[nextMessages.length]);
  };

  const accept = () => { if (!editor || !preview) return; editor.chain().focus().insertContent(preview).run(); setPreview(""); onClose(); };

  return <section className="guided-panel"><header><div><p className="eyebrow">Guided writing</p><h2><MessageCircle size={19} /> One question at a time</h2></div><button type="button" className="icon-button" aria-label="Close guided writing" onClick={onClose}><X size={16} /></button></header>{!preview && <><div className="guided-progress">Step {Math.min(messages.length + 1, 4)} of 4</div><p className="guided-question">{question}</p><textarea aria-label="Guided answer" placeholder="Write a few words or as much as you like..." value={answer} onChange={(event) => setAnswer(event.target.value)} /><button type="button" className="button button-primary" disabled={!answer.trim() || loading} onClick={() => void submitAnswer()}>{loading ? <LoaderCircle className="animate-spin" size={16} /> : <ArrowRight size={16} />} {messages.length === 3 ? "Create diary preview" : "Next question"}</button></>}{loading && <p className="ai-loading"><LoaderCircle className="animate-spin" size={16} /> Creating your diary page...</p>}{error && <p className="ai-error">{error}</p>}{preview && <div className="ai-result"><div className="ai-result-header"><span>Diary preview</span></div><div className="guided-preview" dangerouslySetInnerHTML={{ __html: preview }} /><div className="ai-result-actions"><button type="button" className="button button-ghost" onClick={() => setPreview("")}><X size={15} /> Reject</button><button type="button" className="button button-primary" onClick={accept}><Check size={15} /> Accept entry</button></div></div>}{!preview && messages.length > 0 && <div className="guided-answers">{messages.map((item) => <div key={item.question}><small>{item.question}</small><p>{item.answer}</p></div>)}</div>}</section>;
}
