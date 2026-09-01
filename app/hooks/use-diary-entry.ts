"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, USER_ID } from "@/lib/supabase";

export type SaveState = "loading" | "saved" | "unsaved" | "saving" | "error";

export function useDiaryEntry(entryDate: string) {
  const [content, setContent] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef(content);
  const loadedRef = useRef(false);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    let active = true;
    loadedRef.current = false;

    async function loadEntry() {
      const { data, error: queryError } = await supabase
        .from("diary_entries")
        .select("content")
        .eq("entry_date", entryDate)
        .eq("user_id", USER_ID)
        .maybeSingle();

      if (!active) return;
      if (queryError) {
        setError("Could not load this page. Check your Supabase table and connection.");
        setSaveState("error");
        return;
      }
      setError(null);
      setSaveState("loading");
      setContent(data?.content ?? "");
      contentRef.current = data?.content ?? "";
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
    const { error: upsertError } = await supabase.from("diary_entries").upsert(
      {
        entry_date: entryDate,
        content: nextContent,
        user_id: USER_ID,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,entry_date" },
    );
    if (upsertError) {
      setError("Your changes could not be saved. Please try again.");
      setSaveState("error");
      return false;
    }
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

  return { content, updateContent, save, saveState, error };
}
