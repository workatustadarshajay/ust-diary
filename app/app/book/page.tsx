import { redirect } from "next/navigation";
import { format, startOfToday } from "date-fns";

export default function BookIndexPage() {
  redirect(`/book/${format(startOfToday(), "yyyy-MM-dd")}`);
}
