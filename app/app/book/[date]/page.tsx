"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addDays, isSameDay } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarDays, Download, PenLine, Printer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { formatHeadingDate, fromDateKey, toDateKey } from "@/lib/dates";
import { supabase, USER_ID } from "@/lib/supabase";

export default function BookEntryPage() {
  const params = useParams<{ date: string }>();
  const router = useRouter();
  const date = params.date;
  const parsedDate = fromDateKey(date);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{ tags: string[]; mood: string | null }>({ tags: [], mood: null });

  useEffect(() => {
    if (!parsedDate) return;
    let active = true;
    async function loadEntry() {
      const { data, error: queryError } = await supabase.from("diary_entries").select("content, tags, mood").eq("entry_date", date).eq("user_id", USER_ID).maybeSingle();
      if (!active) return;
      if (queryError) setError("Could not open this page. Check your Supabase connection.");
      else { setContent(data?.content ?? ""); setMetadata({ tags: data?.tags ?? [], mood: data?.mood ?? null }); }
    }
    void loadEntry();
    return () => { active = false; };
  }, [date, parsedDate]);

  if (!parsedDate) return <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-16"><p className="eyebrow">Page not found</p><h1 className="display-title mt-4 text-5xl">That date is not valid.</h1><Link className="button button-primary mt-8 w-fit" href="/">Back to calendar</Link></main>;

  const previousDate = toDateKey(addDays(parsedDate, -1));
  const nextDate = toDateKey(addDays(parsedDate, 1));
  const isToday = isSameDay(parsedDate, new Date());

  return (
    <main className="book-stage flex-1 px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 pb-6">
        <Link className="button button-ghost" href="/"><CalendarDays size={16} /> Calendar</Link>
        <div className="flex gap-2"><button className="button button-ghost" onClick={() => window.print()}><Printer size={16} /> Print</button><button className="button button-ghost" onClick={() => { const blob = new Blob([content ?? ""], { type: "text/html" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `ust-diary-${date}.html`; link.click(); URL.revokeObjectURL(link.href); }}><Download size={16} /> Export</button><button className="button button-primary" onClick={() => router.push(`/day/${date}`)}><PenLine size={16} /> Edit page</button></div>
      </div>
      <article className="book-page">
        <div className="book-kicker">{isToday ? "Today" : "A page from your diary"}</div>
        <h1 className="book-title">{formatHeadingDate(parsedDate)}</h1>
        <div className="book-rule" />
        {(metadata.mood || metadata.tags.length > 0) && <div className="mb-7 flex flex-wrap gap-2 text-xs text-[var(--ink-muted)]"><span className="book-meta">{metadata.mood ?? ""}</span>{metadata.tags.map((tag) => <span className="book-meta" key={tag}>#{tag}</span>)}</div>}
        {error ? <p className="py-14 text-center text-sm text-red-800">{error}</p> : content === null ? <p className="py-14 text-center text-sm text-[var(--ink-muted)]">Opening this page...</p> : content ? <div className="prose prose-stone max-w-none book-content" dangerouslySetInnerHTML={{ __html: content }} /> : <div className="book-empty"><p>This page is waiting for your words.</p><button className="button button-primary" onClick={() => router.push(`/day/${date}`)}>Write on this day <PenLine size={16} /></button></div>}
        <footer className="book-footer">
          <Link className="book-nav" href={`/book/${previousDate}`}><ArrowLeft size={16} /> Previous day</Link>
          <span>{date}</span>
          <Link className="book-nav" href={`/book/${nextDate}`}>Next day <ArrowRight size={16} /></Link>
        </footer>
      </article>
    </main>
  );
}
