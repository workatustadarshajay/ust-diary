"use client";

import { format, subDays } from "date-fns";
import DiaryAIReport from "@/components/diary-ai-report";

export default function WeeklyReviewPage() {
  const end = new Date();
  return <DiaryAIReport mode="weekly" startDate={format(subDays(end, 6), "yyyy-MM-dd")} endDate={format(end, "yyyy-MM-dd")} />;
}
