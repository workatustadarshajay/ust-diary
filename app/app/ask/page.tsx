"use client";

import { format, subYears } from "date-fns";
import DiaryAIReport from "@/components/diary-ai-report";

export default function AskDiaryPage() {
  const end = new Date();
  return <DiaryAIReport mode="ask" startDate={format(subYears(end, 2), "yyyy-MM-dd")} endDate={format(end, "yyyy-MM-dd")} />;
}
