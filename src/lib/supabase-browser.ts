import { createClient } from "@supabase/supabase-js";

/**
 * Singleton Supabase client for the BROWSER (the static admin portal).
 *
 * The admin pages are pre-rendered (SSG) — they ship no server logic — so all
 * auth and CRUD happens here, in the client, against this instance.
 *
 * Security notes (principle of least privilege):
 *  - Same public anon key as the server client. It is safe to expose.
 *  - Write access (insert / update / delete) is granted by RLS ONLY to the
 *    `authenticated` role, i.e. a logged-in admin. An anonymous visitor holding
 *    this key still cannot modify anything.
 *  - `persistSession` keeps the logged-in session in localStorage so protected
 *    routes can check it and redirect to /admin/login when it is missing.
 */
export const supabaseBrowser = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
