# Supabase Setup Guide

Follow these steps once to provision the backend (database, auth, storage).
Everything is done from the [Supabase Dashboard](https://supabase.com/dashboard).

---

## 1. Create the project

1. Sign in at <https://supabase.com> and click **New project**.
2. Pick a name (e.g. `astroshop`), a database password, and a region.
3. Wait ~2 minutes for it to finish provisioning.

## 2. Create the database tables, policies and seed data

1. In the dashboard go to **SQL Editor → New query**.
2. Open [`supabase/schema.sql`](./supabase/schema.sql) from this repo, copy its
   **entire** contents into the editor.
3. Click **Run**. This creates:
   - the `products` table (with indexes for search/filter),
   - Row Level Security policies (least privilege — see below),
   - the storage policies for the `product-images` bucket,
   - 10 sample products so the catalog isn't empty.

> If the storage policies (section 3 of the SQL) fail because the bucket does
> not exist yet, create the bucket first (next step) and re-run just that
> section.

## 3. Create the Storage bucket

1. Go to **Storage → New bucket**.
2. Name it exactly `product-images`.
3. Turn **Public bucket ON** (product images must be readable by anyone).
4. Click **Create bucket**.
5. If you skipped the storage policies in step 2, re-run section 3 of
   `supabase/schema.sql` now.

## 4. Create the admin user

The admin portal does **not** allow public sign-up — admin accounts are
provisioned manually (least privilege: only people who should manage the
catalog get an account).

1. Go to **Authentication → Users → Add user → Create new user**.
2. Enter an email and password, and tick **Auto Confirm User**.
3. (Recommended) Go to **Authentication → Providers → Email** and turn
   **Allow new users to sign up** OFF.

These are the credentials you'll use to log in at `/admin/login`.

## 5. Copy your API credentials

1. Go to **Project Settings → API**.
2. Copy:
   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **`anon` `public` key** → `PUBLIC_SUPABASE_ANON_KEY`
3. Paste them into your local `.env` file (copy `.env.example` first):

   ```
   PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

> ⚠️ Never put the **`service_role`** key in this project. It bypasses RLS and
> is not needed anywhere — the whole app runs on the `anon` key.

---

## Principle of least privilege — how it's applied

| Concern              | Decision                                                                 |
| -------------------- | ------------------------------------------------------------------------ |
| API key used         | Only the **public `anon` key**. The privileged `service_role` key is never used. |
| Database access      | **RLS enabled** on `products`. Default = deny. `anon` can only `SELECT`.  |
| Write access         | `INSERT` / `UPDATE` / `DELETE` granted **only to the `authenticated` role** (a logged-in admin). |
| Storage reads        | Anyone can read images in the `product-images` bucket (needed for the catalog). |
| Storage writes       | Upload / delete on `product-images` granted **only to `authenticated`**.  |
| Admin accounts       | No public sign-up. Admins are created manually in the dashboard.         |

The result: even though the `anon` key is shipped to the browser, an anonymous
visitor can do nothing but read the catalog. Every write path requires a real
Supabase Auth session.
