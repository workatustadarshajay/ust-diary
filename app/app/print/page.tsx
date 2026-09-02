"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { eachDayOfInterval, format, isValid, parseISO } from "date-fns";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { supabase, USER_ID } from "@/lib/supabase";
import { formatHeadingDate, toDateKey } from "@/lib/dates";

type Entry = { entry_date: string; content: string; tags: string[]; mood: string | null };

function todayKey() { return format(new Date(), "yyyy-MM-dd"); }

export default function PrintDiaryPage() {
  const [startDate, setStartDate] = useState(todayKey());
  const [endDate, setEndDate] = useState(todayKey());
  const [includeEmpty, setIncludeEmpty] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const range = useMemo(() => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return isValid(start) && isValid(end) && start <= end ? eachDayOfInterval({ start, end }) : [];
  }, [startDate, endDate]);
  const entryMap = useMemo(() => new Map(entries.map((entry) => [entry.entry_date, entry])), [entries]);
  const pages = useMemo(() => range.map((date) => ({ date, entry: entryMap.get(toDateKey(date)) })).filter((page) => includeEmpty || Boolean(page.entry?.content?.trim())), [entryMap, includeEmpty, range]);

  useEffect(() => {
    let active = true;
    async function loadEntries() {
      setLoaded(false); setError("");
      if (!range.length) { setLoaded(true); setError("Choose a valid start and end date."); return; }
      const { data, error: queryError } = await supabase.from("diary_entries").select("entry_date, content, tags, mood").eq("user_id", USER_ID).gte("entry_date", startDate).lte("entry_date", endDate).order("entry_date", { ascending: true });
      if (!active) return;
      if (queryError) setError("Could not load entries. Check your Supabase connection.");
      else setEntries(data ?? []);
      setLoaded(true);
    }
    void loadEntries();
    return () => { active = false; };
  }, [endDate, range.length, startDate]);

  const exportHtml = () => {
    const html = pages.map(({ date, entry }) => `<article class="print-entry"><p class="print-kicker">UST Diary</p><h1>${formatHeadingDate(date)}</h1>${entry?.content || "<p class=\"print-empty\">No entry yet.</p>"}</article>`).join("\n");
    const blob = new Blob([`<!doctype html><html><head><meta charset="utf-8"><title>UST Diary ${startDate} to ${endDate}</title></head><body>${html}</body></html>`], { type: "text/html" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `ust-diary-${startDate}-to-${endDate}.html`; link.click(); URL.revokeObjectURL(url);
  };

  return <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 lg:py-12"><header className="print-tools-header"><div><Link className="back-link" href="/"><ArrowLeft size={15} /> Calendar</Link><p className="eyebrow mt-7">Print collection</p><h1 className="display-title mt-3 text-6xl">Choose your pages.</h1><p className="mt-3 max-w-lg text-[var(--ink-muted)]">Select a date range and decide whether quiet days should stay in the story.</p></div><div className="print-actions"><button className="button button-ghost" onClick={exportHtml} disabled={!loaded || !pages.length}><Download size={16} /> Export HTML</button><button className="button button-primary" onClick={() => window.print()} disabled={!loaded || !pages.length}><Printer size={16} /> Print pages</button></div></header><section className="print-controls paper-panel"><label>From<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label>To<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label><label className="empty-toggle"><input type="checkbox" checked={includeEmpty} onChange={(event) => setIncludeEmpty(event.target.checked)} /><span><strong>Include empty dates</strong><small>Keep missing days as blank pages</small></span></label><div className="print-count">{pages.length} {pages.length === 1 ? "page" : "pages"} selected</div></section>{error && <p className="print-error">{error}</p>}<section className="print-preview">{loaded && pages.map(({ date, entry }) => <article className="print-entry" key={toDateKey(date)}><p className="print-kicker">UST Diary</p><h2>{formatHeadingDate(date)}</h2><div className="book-rule" />{entry?.content ? <div className="prose prose-stone max-w-none book-content" dangerouslySetInnerHTML={{ __html: entry.content }} /> : <p className="print-empty">No entry for this day.</p>}{entry?.mood && <p className="print-meta">Mood: {entry.mood}</p>}</article>)}</section></main>;
}
