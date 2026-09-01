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
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [entryDates, setEntryDates] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const days = useMemo(() => getMonthGrid(month), [month]);

  useEffect(() => {
    let active = true;
    const first = days[0];
    const last = days[days.length - 1];

    async function loadEntries() {
      const { data, error: queryError } = await supabase
        .from("diary_entries")
        .select("entry_date")
        .eq("user_id", USER_ID)
        .gte("entry_date", toDateKey(first))
        .lte("entry_date", toDateKey(last));

      if (!active) return;
      if (queryError) {
        setError("Connect the diary_entries table in Supabase to load your entries.");
        return;
      }
      setError(null);
      setEntryDates(new Set((data ?? []).map((entry) => entry.entry_date)));
    }

    void loadEntries();
    return () => {
      active = false;
    };
  }, [days]);

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

        <div className="grid grid-cols-7 border-b border-[var(--line)] bg-[var(--cream-deep)]">
          {weekdayLabels.map((label) => <div key={label} className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink-muted)]">{label}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = toDateKey(day);
            const isCurrentMonth = isSameCalendarMonth(day, month);
            const isToday = isSameDay(day, today);
            const hasEntry = entryDates.has(key);
            return (
              <button
                key={key}
                aria-label={`Write for ${key}`}
                onClick={() => router.push(`/day/${key}`)}
                className={`day-cell ${isCurrentMonth ? "" : "day-cell-muted"} ${isToday ? "day-cell-today" : ""}`}
              >
                <span>{day.getDate()}</span>
                {hasEntry && <span className="entry-dot" aria-label="Has entry" />}
              </button>
            );
          })}
        </div>
      </section>
      <p className="mt-5 text-center text-xs text-[var(--ink-faint)]">Select any date to open its page.</p>
    </main>
  );
}
