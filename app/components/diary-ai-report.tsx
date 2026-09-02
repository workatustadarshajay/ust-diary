"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle, Sparkles, X } from "lucide-react";
import { supabase, USER_ID } from "@/lib/supabase";

type Entry = { entry_date: string; content: string; mood: string | null; tags: string[] };
type Props = { mode: "weekly" | "ask"; startDate: string; endDate: string };

export default function DiaryAIReport({ mode, startDate, endDate }: Props) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);

  const run = async () => {
    setLoading(true); setError(""); setResult("");
    const { data, error: queryError } = await supabase.from("diary_entries").select("entry_date, content, mood, tags").eq("user_id", USER_ID).gte("entry_date", startDate).lte("entry_date", endDate).order("entry_date", { ascending: true });
    if (queryError) { setError("Could not load diary entries. Check your Supabase connection."); setLoading(false); return; }
    const loaded = data ?? []; setEntries(loaded);
    if (!loaded.length) { setError("There are no diary entries in this range yet."); setLoading(false); return; }
    const context = loaded.map((entry) => `[${entry.entry_date}] ${entry.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}`).join("\n");
    const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode === "weekly" ? "weekly-review" : "ask-diary", text: context, instruction: mode === "ask" ? question : "" }) });
    const payload = await response.json() as { result?: string; error?: string };
    if (!response.ok) setError(payload.error ?? "The AI report could not be created."); else setResult(payload.result ?? "");
    setLoading(false);
  };

  const isAsk = mode === "ask";

  return (
    <main className="report-page">
      <div className="report-topline">
        <Link className="back-link" href="/"><ArrowLeft size={15} /> Calendar</Link>
        <span className="report-context">UST Diary / {isAsk ? "Ask" : "Review"}</span>
      </div>
      <header className="report-hero">
        <div>
          <p className="eyebrow">{isAsk ? "Private diary search" : "Weekly reflection"}</p>
          <h1>{isAsk ? "Ask your diary." : "Look back gently."}</h1>
          <p>{isAsk ? "Find answers inside your saved pages, with the dates that support them." : `Reflect on ${startDate} to ${endDate}, with the original source dates kept visible.`}</p>
        </div>
        <div className="report-mark"><Sparkles size={24} /><span>AI<br />COMPANION</span></div>
      </header>
      <section className="report-workspace">
        <div className="report-form">
          <div className="report-form-heading"><span className="step-number">01</span><div><p className="eyebrow">Your request</p><h2>{isAsk ? "What would you like to know?" : "Your review window"}</h2></div></div>
          {isAsk ? <textarea className="report-question" aria-label="Question for diary" placeholder="When did I last mention my exam?" value={question} onChange={(event) => setQuestion(event.target.value)} /> : <div className="report-range"><span>{startDate}</span><b>to</b><span>{endDate}</span></div>}
          <div className="report-form-footer"><span className="report-privacy">Uses only your saved diary entries</span><button type="button" className="button button-primary" disabled={loading || (isAsk && !question.trim())} onClick={() => void run()}>{loading ? <><LoaderCircle className="animate-spin" size={16} /> Thinking</> : <><Sparkles size={16} /> {isAsk ? "Ask my diary" : "Create review"}</>}</button></div>
        </div>
        <div className={`report-result-area ${result ? "has-result" : ""}`}>
          {error && <p className="ai-error">{error}</p>}
          {!result && !error && <div className="report-empty"><div className="empty-icon"><Sparkles size={20} /></div><p>{isAsk ? "Your answer will appear here with source dates." : "Your weekly reflection will appear here."}</p></div>}
          {result && <div className="report-result"><div className="report-result-heading"><div><span className="step-number">02</span><span className="eyebrow">Generated preview</span></div><button type="button" className="icon-button" aria-label="Reject report" onClick={() => setResult("")}><X size={15} /></button></div><div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: result }} /><div className="report-source"><Check size={14} /> Grounded in {entries.length} dated {entries.length === 1 ? "entry" : "entries"}</div></div>}
        </div>
      </section>
    </main>
  );
}
