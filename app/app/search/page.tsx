"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { supabase, USER_ID } from "@/lib/supabase";

type Result = { entry_date: string; content: string; tags: string[]; mood: string | null };

export default function SearchPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState("");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("diary_entries").select("entry_date, content, tags, mood").eq("user_id", USER_ID).order("entry_date", { ascending: false });
      setResults(data ?? []);
      setLoading(false);
    }
    void load();
  }, []);

  const filtered = results.filter((entry) => {
    const text = `${entry.content} ${entry.entry_date} ${(entry.tags ?? []).join(" ")}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (!mood || entry.mood === mood) && (!tag || (entry.tags ?? []).includes(tag));
  });

  return <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 lg:py-12"><div className="mb-8"><p className="eyebrow">Your archive</p><h1 className="display-title mt-3 text-6xl">Find a page.</h1></div><section className="paper-panel overflow-hidden"><div className="archive-controls"><div className="archive-search"><Search size={17} /><input aria-label="Search diary" placeholder="Search diary text, dates, or tags" value={query} onChange={(event) => setQuery(event.target.value)} /></div><select aria-label="Filter by mood" value={mood} onChange={(event) => setMood(event.target.value)}><option value="">All moods</option><option>Joyful</option><option>Calm</option><option>Focused</option><option>Tired</option><option>Heavy</option></select><div className="archive-tag"><SlidersHorizontal size={15} /><input aria-label="Filter by tag" placeholder="Tag" value={tag} onChange={(event) => setTag(event.target.value)} /></div></div>{loading ? <p className="archive-empty">Loading archive...</p> : filtered.length === 0 ? <p className="archive-empty">No matching pages yet.</p> : <div className="archive-list">{filtered.map((entry) => <Link className="archive-item" key={entry.entry_date} href={`/book/${entry.entry_date}`}><span className="archive-date">{entry.entry_date}</span><span className="archive-preview">{entry.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 150) || "Empty page"}</span><span className="archive-mood">{entry.mood ?? ""}</span></Link>)}</div>}</section></main>;
}
