import { createClient } from "@supabase/supabase-js";

// Replace these with your actual Supabase URL and public key
const SUPABASE_URL = "https://fjmmdyjgjnrjkpuodebq.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_jBVBJMWMXCxk4JY4t9K-Ew_6qEiWTMQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
