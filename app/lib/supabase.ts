import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const USER_ID = "default-user";

export interface DiaryEntry {
  id: string;
  entry_date: string;
  content: string;
  tags: string[];
  mood: string | null;
  prompt: string | null;
  template: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}
