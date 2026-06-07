import { createBrowserClient } from "@supabase/ssr";

// This SSR client automatically syncs your login session to HTTP cookies
// so your Next.js middleware can read it and unlock the dashboard!
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);