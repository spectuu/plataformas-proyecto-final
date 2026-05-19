# ⚡ AstroShop — Hybrid E-Commerce

A complete e-commerce built with **Astro**, deployed on **Cloudflare**, with
**Supabase** for auth, database and storage. It demonstrates a **hybrid
architecture**: dynamic content where it matters, static content where it
doesn't.

> Final project — Platforms course.

---

## 🏗️ Hybrid architecture

The same project mixes two rendering strategies on Cloudflare:

| Part                | Route(s)              | Rendering            | Why                                                                 |
| ------------------- | --------------------- | -------------------- | ------------------------------------------------------------------- |
| **Storefront**      | `/`, `/products/[id]` | **SSR** (Workers)    | Catalog & product detail are read from Supabase **on every request**, so price and stock are always fresh. |
| **Admin portal**    | `/admin`, `/admin/login` | **SSG** (build time) | The HTML is not user-sensitive on the server. Auth + CRUD run **client-side**; access is enforced by Supabase Auth + RLS. |

This is configured with `output: 'server'` in `astro.config.mjs` (SSR by
default) and `export const prerender = true` on the admin pages (opt into
static).

---

## 🚀 Tech stack

- **Astro** — hybrid framework (SSR + SSG in one project)
- **Cloudflare** — Workers (SSR) + Pages (SSG hosting), via `@astrojs/cloudflare`
- **Supabase** — Auth + Postgres database + Storage
- **TailwindCSS** — responsive styling

---

## ✨ Features

**Storefront (SSR)**

- Public catalog: product image, name and price, queried from Supabase per request
- Product detail page, dynamic by `id`
- Search by name + filter by category (URL-driven, server-rendered)
- Pagination (`PAGE_SIZE = 8`)

**Admin portal (SSG)**

- Login / logout with Supabase Auth
- Full product CRUD (create, edit, delete)
- Image upload to Supabase Storage
- Protected routes — redirect to `/admin/login` when there is no session
- Loading and error states throughout (auth check, list, save, delete)

**Cross-cutting**

- Responsive design (TailwindCSS)
- Principle of least privilege — see [SETUP.md](./SETUP.md#principle-of-least-privilege--how-its-applied)

---

## 📁 Project structure

```text
/
├── public/                     # static assets
├── supabase/
│   └── schema.sql              # tables + RLS + storage policies + seed data
├── src/
│   ├── components/
│   │   ├── StoreHeader.astro   # storefront nav
│   │   ├── Footer.astro
│   │   ├── ProductCard.astro
│   │   ├── SearchBar.astro     # name search + category filter (GET form)
│   │   └── Pagination.astro
│   ├── layouts/
│   │   └── Layout.astro        # base HTML shell
│   ├── lib/
│   │   ├── types.ts            # Product type + shared constants
│   │   ├── supabase.ts         # SERVER client (SSR storefront)
│   │   ├── supabase-browser.ts # BROWSER client (admin portal)
│   │   └── products.ts         # client-side CRUD + image helpers
│   ├── pages/
│   │   ├── index.astro         # SSR — catalog (search, filter, pagination)
│   │   ├── products/[id].astro # SSR — product detail
│   │   └── admin/
│   │       ├── login.astro     # SSG — login
│   │       └── index.astro     # SSG — dashboard + CRUD
│   ├── styles/global.css
│   └── env.d.ts
├── astro.config.mjs            # hybrid config (output: 'server' + adapter)
├── wrangler.jsonc              # Cloudflare config
├── SETUP.md                    # Supabase setup step-by-step
└── .env.example
```

---

## 🛠️ Local development

### 1. Install dependencies

```sh
npm install
```

### 2. Set up Supabase

Follow **[SETUP.md](./SETUP.md)** — it walks through creating the project,
running `supabase/schema.sql`, creating the Storage bucket and the admin user.

### 3. Configure environment variables

```sh
cp .env.example .env
```

Then fill in `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` with the
values from your Supabase project (Project Settings → API).

### 4. Run the dev server

```sh
npm run dev
```

- Storefront: <http://localhost:4321>
- Admin: <http://localhost:4321/admin>

---

## ☁️ Deploy to Cloudflare Pages

1. Push this repo to **GitHub** (public).
2. In the [Cloudflare dashboard](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages → Connect to Git**, select the repo.
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add the **environment variables** (Settings → Environment variables), for
   the Production environment:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
5. **Save and Deploy.** Cloudflare runs the build: the admin pages are
   pre-rendered (SSG) and the catalog/detail run as a Worker (SSR) — both from
   the same deployment.

> The `PUBLIC_` variables are inlined at **build time**, so they must be set in
> the Cloudflare dashboard before deploying (not only in your local `.env`).

---

## 🧞 Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Start the dev server at `localhost:4321`     |
| `npm run build`   | Build for production into `./dist/`          |
| `npm run preview` | Preview the production build locally         |

---

## 🔐 Security — least privilege

The app only ever uses the **public `anon` key**. The privileged `service_role`
key is never used. Row Level Security makes the `anon` key read-only on
`products`; every write requires an authenticated admin session. Full breakdown
in [SETUP.md](./SETUP.md#principle-of-least-privilege--how-its-applied).
#
