"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, USER_ID } from "@/lib/supabase";

export type SaveState = "loading" | "saved" | "unsaved" | "saving" | "error";

export type DiaryMetadata = {
  tags: string[];
  mood: string | null;
  prompt: string | null;
  template: string | null;
};

export type DiaryVersion = { id: string; content: string; created_at: string };

export function useDiaryEntry(entryDate: string) {
  const [content, setContent] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [metadata, setMetadata] = useState<DiaryMetadata>({ tags: [], mood: null, prompt: null, template: null });
  const [versions, setVersions] = useState<DiaryVersion[]>([]);
  const contentRef = useRef(content);
  const metadataRef = useRef(metadata);
  const loadedRef = useRef(false);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    metadataRef.current = metadata;
  }, [metadata]);

  useEffect(() => {
    let active = true;
    loadedRef.current = false;

    async function loadEntry() {
      const { data, error: queryError } = await supabase
        .from("diary_entries")
        .select("content, tags, mood, prompt, template, updated_at")
        .eq("entry_date", entryDate)
        .eq("user_id", USER_ID)
        .maybeSingle();

      if (!active) return;
      if (queryError) {
        let recovered = "";
        try { recovered = window.localStorage.getItem(`ust-diary:${entryDate}`) ?? ""; } catch { /* storage may be unavailable */ }
        if (recovered) {
          setContent(recovered);
          contentRef.current = recovered;
          loadedRef.current = true;
          setSaveState("unsaved");
          setError("Offline draft recovered. It will retry saving automatically.");
        } else {
          setError("Could not load this page. Check your Supabase table and connection.");
          setSaveState("error");
        }
        return;
      }
      setError(null);
      setSaveState("loading");
      setContent(data?.content ?? "");
      contentRef.current = data?.content ?? "";
      setMetadata({ tags: data?.tags ?? [], mood: data?.mood ?? null, prompt: data?.prompt ?? null, template: data?.template ?? null });
      setLastSavedAt(data?.updated_at ? new Date(data.updated_at) : null);
      loadedRef.current = true;
      setSaveState("saved");
    }

    void loadEntry();
    return () => {
      active = false;
    };
  }, [entryDate]);

  const save = useCallback(async (nextContent = contentRef.current) => {
    if (!loadedRef.current) return false;
    setSaveState("saving");
    setError(null);
    const { data: entry, error: upsertError } = await supabase.from("diary_entries").upsert(
      {
        entry_date: entryDate,
        content: nextContent,
        tags: metadataRef.current.tags,
        mood: metadataRef.current.mood,
        prompt: metadataRef.current.prompt,
        template: metadataRef.current.template,
        user_id: USER_ID,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,entry_date" },
    ).select("id").single();
    if (upsertError) {
      try { window.localStorage.setItem(`ust-diary:${entryDate}`, nextContent); } catch { /* storage may be unavailable */ }
      setError("Your changes could not be saved. Please try again.");
      setSaveState("error");
      return false;
    }
    if (entry) {
      await supabase.from("diary_entry_versions").insert({ entry_id: entry.id, entry_date: entryDate, content: nextContent });
      const { data: savedVersions } = await supabase.from("diary_entry_versions").select("id, content, created_at").eq("entry_id", entry.id).order("created_at", { ascending: false }).limit(10);
      setVersions(savedVersions ?? []);
    }
    setLastSavedAt(new Date());
    try { window.localStorage.removeItem(`ust-diary:${entryDate}`); } catch { /* storage may be unavailable */ }
    setSaveState("saved");
    return true;
  }, [entryDate]);

  useEffect(() => {
    if (!loadedRef.current || saveState !== "unsaved") return;
    const timer = window.setTimeout(() => void save(), 1500);
    return () => window.clearTimeout(timer);
  }, [content, save, saveState]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [save]);

  const updateContent = useCallback((nextContent: string) => {
    contentRef.current = nextContent;
    setContent(nextContent);
    if (loadedRef.current) setSaveState("unsaved");
  }, []);

  const updateMetadata = useCallback((nextMetadata: DiaryMetadata) => {
    setMetadata(nextMetadata);
    if (loadedRef.current) setSaveState("unsaved");
  }, []);

  return { content, updateContent, metadata, updateMetadata, versions, save, saveState, error, lastSavedAt };
}
