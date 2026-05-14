import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for SERVER-SIDE rendering (the public storefront).
 *
 * Security notes (principle of least privilege):
 *  - Uses ONLY the public anon key. The privileged `service_role` key never
 *    touches this codebase.
 *  - The anon key can do nothing that Row Level Security (RLS) does not allow.
 *    For the storefront that means read-only `SELECT` on `products`.
 *  - No session is persisted: storefront requests are anonymous, so there is
 *    no auth state to keep between requests.
 */
export function createServerClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in your .env file " +
        "(and in the Cloudflare Pages dashboard for production).",
    );
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
