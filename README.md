# Ngecomic

**Baca Manga, Manhwa & Komik Favoritmu — Gratis, Cepat, Brutal.**

Ngecomic adalah platform baca manga online dengan tampilan brutalist/neon yang unik. Dibangun dengan **Next.js 16**, **React 19**, **Tailwind CSS v4**, dan **Neon PostgreSQL**.

---

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| 🏠 **Homepage** | Hero section, Trending, Update Terbaru, Semua Komik, Explore Genre, Request form |
| 🔍 **Pencarian** | Cari komik berdasarkan judul |
| 📖 **Baca Chapter** | Reader dengan gambar full-width, auto-log reading history |
| ⭐ **Favorit** | Tandai komik favoritmu |
| 👤 **Akun & Level** | Daftar/login, naik level makin sering baca |
| 🛡️ **Admin Panel** | Dashboard statistik, manajemen user |
| 🖼️ **Image Proxy** | Anti-hotlink bypass via server-side proxy |
| 🎨 **Brutalist UI** | Dark theme, neon accent, glitch animation, CRT scanline |

---

## 🧱 Tech Stack

### Frontend

| Teknologi | Versi | Kegunaan |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.2.9 | Fullstack React framework (App Router, Server Components) |
| [React](https://react.dev/) | 19.2.4 | UI library |
| [Tailwind CSS](https://tailwindcss.com/) | v4 | Utility-first CSS framework |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Type safety |

### Backend & Auth

| Teknologi | Versi | Kegunaan |
|---|---|---|
| [NextAuth.js](https://next-auth.js.org/) | ^5.0.0-beta.31 | Authentication (Credentials provider, JWT) |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | ^3.0.3 | Password hashing |
| [Neon Serverless](https://neon.tech/docs/serverless/serverless-driver) | ^1.1.0 | PostgreSQL driver for serverless |
| [Neon PostgreSQL](https://neon.tech/) | - | Serverless PostgreSQL database |

### Data Source

| Sumber | URL |
|---|---|
| **Sanka Vollerei API** | `https://www.sankavollerei.web.id` |
| **Image CDN** | `img.klikcdn.com` |
| **Image CDN** | `komikstation.org` |

### Tools

| Tools | Kegunaan |
|---|---|
| ESLint | Linting |
| Geist Font | Typeface (Sans & Mono) |

---

## 📁 Struktur Folder

```
ngecomic/
├── .env.local                         # Environment variables (local)
├── next.config.ts                     # Next.js config
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript config
├── postcss.config.mjs                 # PostCSS (Tailwind)
├── eslint.config.mjs                  # ESLint
├── public/                            # Static assets
└── src/
    ├── proxy.ts                       # (unused) auth middleware template
    ├── lib/
    │   ├── api.ts                     # External API client (fetch, retry, proxy)
    │   ├── auth.ts                    # NextAuth instance (Credentials provider)
    │   ├── auth.config.ts             # NextAuth config (callbacks, pages)
    │   ├── db.ts                      # Neon PostgreSQL pool & query helper
    │   ├── init-db.ts                 # Schema initializer
    │   ├── types.ts                   # TypeScript interfaces
    │   ├── schema.sql                 # Database schema (4 tables)
    │   └── next-auth.d.ts             # NextAuth type augmentations
    ├── components/
    │   ├── Navbar.tsx                 # Navigasi sticky
    │   ├── Footer.tsx                 # Footer lengkap
    │   ├── ComicCard.tsx              # Card komik reusable
    │   ├── ComicImage.tsx             # Image component + proxy fallback
    │   ├── SessionProvider.tsx        # NextAuth provider wrapper
    │   └── LevelBadge.tsx             # Badge level user
    └── app/
        ├── globals.css                # Tailwind v4 theme + animasi
        ├── layout.tsx                 # Root layout (navbar, footer)
        ├── page.tsx                   # Homepage SSR
        ├── HomeClient.tsx             # Homepage client component
        ├── not-found.tsx              # Halaman 404
        ├── login/page.tsx             # Login page
        ├── register/page.tsx          # Register page
        ├── search/page.tsx            # Search page
        ├── favorites/page.tsx         # Favorites (protected)
        ├── populer/page.tsx           # Popular comics
        ├── terbaru/page.tsx           # Latest updates
        ├── comic/
        │   └── [slug]/
        │       ├── page.tsx           # Comic detail SSR
        │       └── ComicDetailClient.tsx
        ├── chapter/
        │   └── [slug]/
        │       ├── page.tsx           # Chapter reader SSR
        │       └── ChapterReaderClient.tsx
        ├── admin/
        │   ├── page.tsx               # Admin dashboard (protected)
        │   └── users/page.tsx         # Admin user management
        └── api/
            ├── auth/[...nextauth]/route.ts
            ├── register/route.ts
            ├── favorites/
            │   ├── route.ts
            │   └── check/route.ts
            ├── reading/route.ts
            ├── user/level/route.ts
            ├── comic/[...path]/route.ts    # API proxy (catch-all)
            ├── proxy/route.ts              # Search proxy
            ├── img/route.ts                # Image proxy
            ├── init/route.ts               # DB init
            └── admin/
                ├── stats/route.ts
                └── users/route.ts
```

---

## 🗄️ Database Schema

### `users`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `SERIAL PK` | Auto-increment |
| `name` | `VARCHAR(255)` | Nama user |
| `email` | `VARCHAR(255) UNIQUE` | Email login |
| `password` | `VARCHAR(255)` | bcrypt hash |
| `role` | `VARCHAR(20)` | `'user'` atau `'admin'` |
| `level` | `INTEGER DEFAULT 1` | Level (1-10) |
| `total_reads` | `INTEGER DEFAULT 0` | Total baca chapter |
| `created_at` | `TIMESTAMP` | Waktu daftar |

### `favorites`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `SERIAL PK` | Auto-increment |
| `user_id` | `INTEGER FK → users` | Pemilik favorit |
| `comic_slug` | `VARCHAR(255)` | Slug komik |
| `comic_title` | `VARCHAR(255)` | Judul komik |
| `comic_image` | `VARCHAR(500)` | URL cover |
| `created_at` | `TIMESTAMP` | Waktu nambah |

**Unique:** `(user_id, comic_slug)`

### `reading_history`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `SERIAL PK` | Auto-increment |
| `user_id` | `INTEGER FK → users` | Pembaca |
| `comic_slug` | `VARCHAR(255)` | Slug komik |
| `chapter_slug` | `VARCHAR(255)` | Slug chapter |
| `read_at` | `TIMESTAMP` | Waktu baca |

### `api_logs`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `SERIAL PK` | Auto-increment |
| `endpoint` | `VARCHAR(500)` | Endpoint yang dipanggil |
| `method` | `VARCHAR(10)` | HTTP method |
| `status_code` | `INTEGER` | HTTP status |
| `duration_ms` | `INTEGER` | Waktu respon |
| `user_id` | `INTEGER` | User (nullable) |
| `ip_address` | `VARCHAR(50)` | IP address |
| `created_at` | `TIMESTAMP` | Waktu request |

---

## 📡 API Endpoints (External)

Semua data komik berasal dari Sanka Vollerei API (`https://www.sankavollerei.web.id/comic/komikstation`):

| Endpoint | Method | Keterangan |
|---|---|---|
| `/home` | GET | Trending & latest updates |
| `/ongoing?page=N` | GET | Semua komik ongoing (paginated) |
| `/az-list/{letter}?page=N` | GET | Komik by abjad |
| `/manga/{slug}` | GET | Detail komik |
| `/chapter/{chapterSlug}` | GET | Gambar chapter (16-30 halaman) |

### Internal API (Next.js Routes)

| Endpoint | Method | Auth | Keterangan |
|---|---|---|---|
| `/api/auth/...` | * | - | NextAuth handler |
| `/api/register` | POST | - | Daftar akun |
| `/api/favorites` | GET/POST/DELETE | ✅ | CRUD favorit |
| `/api/favorites/check?slug=` | GET | ✅ | Cek status favorit |
| `/api/reading` | POST | ✅ | Log reading + level up |
| `/api/user/level` | GET | ✅ | Level & total reads |
| `/api/comic/[...path]` | GET | - | Proxy ke external API |
| `/api/proxy?url=` | GET | - | Proxy search |
| `/api/img?url=` | GET | - | Proxy image (bypass anti-hotlink) |
| `/api/init` | GET | - | Inisialisasi database & seed admin |
| `/api/admin/stats` | GET | admin | Dashboard stats |
| `/api/admin/users` | GET | admin | Daftar user |

---

## 📦 Instalasi & Setup

### Prasyarat

- **Node.js** >= 20
- **npm** atau **yarn**
- **Akun Neon PostgreSQL** (gratis di [neon.tech](https://neon.tech))

### Langkah-langkah

```bash
# 1. Clone repositori
git clone https://github.com/khoirulmaksi-glitch/ngecomic.git
cd ngecomic

# 2. Install dependencies
npm install

# 3. Buat file environment
cp .env.local.example .env.local
# Isi DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, API_BASE_URL

# 4. Inisialisasi database (buat tabel & seed admin)
curl http://localhost:3000/api/init

# 5. Jalankan development server
npm run dev

# 6. Build untuk production
npm run build
npm start
```

### Environment Variables

| Variable | Wajib | Default | Keterangan |
|---|---|---|---|
| `DATABASE_URL` | ✅ | - | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | - | Secret untuk JWT (generate: `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | ✅ | `http://localhost:3000` | URL aplikasi |
| `API_BASE_URL` | - | `https://www.sankavollerei.web.id` | Base URL external API |

### Seed Admin

Setelah menjalankan `/api/init`, akun admin default:

- **Email:** `admin@gmail.com`
- **Password:** `admin123`

> ⚠️ **Ganti password admin segera setelah deploy!**

---

## 🏗️ Arsitektur

### Data Flow

```
Browser ──HTTP──► Next.js App Router
                    │
                    ├── Server Components (SSR)
                    │     └── fetchFromAPI() ──► External API (Sanka Vollerei)
                    │
                    ├── Client Components (Hydrate)
                    │     ├── ComicImage ──► /api/img ──► Image CDN
                    │     └── Auth ──► NextAuth ──► Neon DB
                    │
                    └── API Routes
                          ├── /api/comic/[...path] ──► External API
                          ├── /api/img ──► Image CDN (with Referer header)
                          └── /api/* ──► Neon DB
```

### Image Proxy Flow

```
Browser ingin load gambar dari img.klikcdn.com (diblokir anti-hotlink)

1. Browser ──► ComicImage component
2. ComicImage ──► src="/api/img?url=https://img.klikcdn.com/..."
3. /api/img ──► fetch(url, { Referer: "https://komikstation.org/" })
4. Image CDN menerima request (karena Referer header valid)
5. Response dikembalikan ke browser dengan Cache-Control: public, max-age=86400
```

### Level System

| Level | Nama | Total Reads |
|---|---|---|
| 1 | Novice | 0 |
| 2 | Visitor | 3 |
| 3 | Reader | 8 |
| 4 | Bookworm | 15 |
| 5 | Comic Lover | 25 |
| 6 | Manga Addict | 50 |
| 7 | Master Reader | 100 |
| 8 | Comic Sage | 250 |
| 9 | Legendary | 500 |
| 10 | God of Manga | 1000 |

---

## 🎨 Tema & Desain

### Warna Custom

| Token | Hex | Penggunaan |
|---|---|---|
| `neon-pink` | `#ff2d95` | Primary accent |
| `neon-cyan` | `#00f0ff` | Secondary accent |
| `neon-yellow` | `#ffd700` | Rating |
| `neon-green` | `#39ff14` | SEO/accent |
| `brutal-black` | `#0a0a0a` | Background |
| `brutal-white` | `#f5f5f5` | Text |
| `brutal-red` | `#e63946` | Danger |
| `brutal-gray` | `#1a1a1a` | Card bg |

### Animasi

- `glitch` — efek jitter glitch
- `float` — floating hover
- `pulse-glow` — neon pulse
- `scanline` — CRT scanline overlay
- `border-dance` — border berubah warna
- `reveal-up` — fade in + slide up (staggered)
- `skew-in` — fade in + skew
- `scale-in` — scale from 0.8

### Noise Overlay

Fixed SVG fractal noise overlay di `z-9999` dengan `opacity: 0.03` — memberikan efek gritty/tekstur CRT.

---

## 🚀 Deployment ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables di **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `NEXTAUTH_SECRET` | Random string (min 32 chars) |
| `NEXTAUTH_URL` | `https://ngecomic.vercel.app` (URL Vercel lo) |
| `API_BASE_URL` | `https://www.sankavollerei.web.id` |

---

## 🧑‍💻 Kontribusi

1. Fork repositori ini
2. Buat branch fitur (`git checkout -b feat/amazing`)
3. Commit perubahan (`git commit -m 'feat: add amazing feature'`)
4. Push ke branch (`git push origin feat/amazing`)
5. Buka Pull Request

---

## 📄 Lisensi

Private — Hak cipta dilindungi.

---

Dibuat dengan ❤️ oleh **khoirulmaksi-glitch**
