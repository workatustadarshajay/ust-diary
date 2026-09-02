"use client";

import { useEffect, useMemo, useState } from "react";
import { addMonths, isSameDay, subMonths } from "date-fns";
import { ArrowLeft, ArrowRight, BookOpen, PenLine } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  formatMonth,
  getMonthGrid,
  isSameCalendarMonth,
  toDateKey,
} from "@/lib/dates";
import { supabase, USER_ID } from "@/lib/supabase";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarView() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [entries, setEntries] = useState<{ entry_date: string; content: string; mood: string | null }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ currentStreak: 0, longestStreak: 0, totalEntries: 0, totalWords: 0, monthDays: 0 });
  const days = useMemo(() => getMonthGrid(month), [month]);

  useEffect(() => {
    let active = true;
    async function loadEntries() {
      const { data, error: queryError } = await supabase
        .from("diary_entries")
        .select("entry_date, content, mood")
        .eq("user_id", USER_ID)
        .order("entry_date", { ascending: true });

      if (!active) return;
      if (queryError) {
        setError("Connect the diary_entries table in Supabase to load your entries.");
        return;
      }
      setError(null);
      setEntries(data ?? []);
      const all = [...(data ?? [])].sort((a, b) => a.entry_date.localeCompare(b.entry_date));
      const dates = new Set(all.map((entry) => entry.entry_date));
      let currentStreak = 0;
      for (let cursor = new Date(today); dates.has(toDateKey(cursor)); cursor.setDate(cursor.getDate() - 1)) currentStreak += 1;
      let longestStreak = 0;
      let running = 0;
      let previous = "";
      for (const entry of all) { const day = new Date(`${entry.entry_date}T00:00:00`); const expected = previous ? new Date(`${previous}T00:00:00`) : null; if (expected && Math.round((day.getTime() - expected.getTime()) / 86400000) === 1) running += 1; else running = 1; longestStreak = Math.max(longestStreak, running); previous = entry.entry_date; }
      const monthDays = all.filter((entry) => entry.entry_date.startsWith(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`)).length;
      const totalWords = all.reduce((count, entry) => count + (entry.content ?? "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length, 0);
      setStats({ currentStreak, longestStreak, totalEntries: all.length, totalWords, monthDays });
    }

    void loadEntries();
    return () => {
      active = false;
    };
  }, [days, month, today]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <section className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Your quiet corner</p>
          <h1 className="display-title mt-3">Make room for the day.</h1>
          <p className="mt-3 max-w-md text-base leading-7 text-[var(--ink-muted)]">
            A simple place to notice what happened, what mattered, and what comes next.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="button button-ghost" onClick={() => router.push(`/book/${toDateKey(today)}`)}>
            <BookOpen size={17} /> Read diary
          </button>
          <button className="button button-primary" onClick={() => router.push(`/day/${toDateKey(today)}`)}>
            <PenLine size={17} /> Write today
          </button>
        </div>
      </section>

      <section className="paper-panel overflow-hidden">
        <header className="flex flex-col gap-5 border-b border-[var(--line)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="eyebrow">Monthly pages</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]">{formatMonth(month)}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Previous month" className="icon-button" onClick={() => setMonth(subMonths(month, 1))}>
              <ArrowLeft size={18} />
            </button>
            <button className="button button-ghost px-4" onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>Today</button>
            <button aria-label="Next month" className="icon-button" onClick={() => setMonth(addMonths(month, 1))}>
              <ArrowRight size={18} />
            </button>
          </div>
        </header>

        {error && <p className="border-b border-[var(--line)] bg-amber-50 px-5 py-3 text-sm text-amber-900 sm:px-7">{error}</p>}

        <div className="stats-strip"><span><strong>{stats.currentStreak}</strong> day streak</span><span><strong>{stats.totalEntries}</strong> pages</span><span><strong>{stats.totalWords}</strong> words</span><span><strong>{stats.monthDays}</strong> days this month</span><span><strong>{Math.round((stats.monthDays / new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) * 100)}%</strong> month complete</span></div>

        <div className="grid grid-cols-7 border-b border-[var(--line)] bg-[var(--cream-deep)]">
          {weekdayLabels.map((label) => <div key={label} className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink-muted)]">{label}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = toDateKey(day);
            const isCurrentMonth = isSameCalendarMonth(day, month);
            const isToday = isSameDay(day, today);
            const entry = entries.find((item) => item.entry_date === key);
            const hasEntry = Boolean(entry);
            return (
              <button
                key={key}
                aria-label={`Write for ${key}`}
                onClick={() => router.push(`/day/${key}`)}
                className={`day-cell ${isCurrentMonth ? "" : "day-cell-muted"} ${isToday ? "day-cell-today" : ""} ${entry?.mood ? `mood-${entry.mood.toLowerCase()}` : ""}`}
              >
                <span>{day.getDate()}</span>
                {hasEntry && <span className="entry-dot" aria-label={entry?.mood ? `Has entry, mood: ${entry.mood}` : "Has entry"} />}
              </button>
            );
          })}
        </div>
      </section>
      <div className="mood-summary"><span className="eyebrow">This month in color</span>{["Joyful", "Calm", "Focused", "Tired", "Heavy"].map((mood) => <span key={mood} className={`mood-key mood-${mood.toLowerCase()}`}><i /> {mood} {entries.filter((entry) => entry.mood === mood && entry.entry_date.startsWith(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`)).length}</span>)}</div><p className="mt-5 text-center text-xs text-[var(--ink-faint)]">Select any date to open its page.</p>
    </main>
  );
}
