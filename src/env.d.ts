/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Supabase project URL (Project Settings -> API). */
  readonly PUBLIC_SUPABASE_URL: string;
  /** Supabase anon/public key. Safe to expose; constrained by RLS. */
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
