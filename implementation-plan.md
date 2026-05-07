# Step-by-Step Implementation Plan: ProductReview.com.au Clone

This is our master checklist. It weaves **Enterprise Backend Architecture** (Postgres, Redis, Mongo) with **Premium Frontend UI** (Tailwind, shadcn/ui, motion.dev, Zustand). We build the UI *alongside* the backend so we can test everything visually immediately.

---

## Phase 1: Foundation & Premium Design System

### 1.1 Project Cleanup & Database Migration
- [x] Remove old SQL Server dependencies (`mssql`, `msnodesqlv8`) and `lib/db-sql.ts`.
- [ ] Create a Neon Serverless PostgreSQL project (neon.tech) and get the connection string.
- [ ] Update `.env` with the Neon Postgres connection string.

### 1.2 UI/UX Foundation (shadcn/ui & motion.dev)
- [x] Run `npx shadcn@latest init` to set up the design system (Dark Mode by default).
- [x] Install animation & state libraries: `npm install motion zustand lucide-react`.
- [x] Install essential shadcn components we'll need early on:
    - `npx shadcn@latest add button card input label form sonner table skeleton`.
- [x] Define global CSS variables in `globals.css` for our premium color palette (deep blues, gold for stars).

### 1.3 Prisma ORM Setup
- [x] Install Prisma dependencies (`prisma`, `@prisma/client`, `@neondatabase/serverless`, `@prisma/adapter-neon`).
- [x] Initialize Prisma (`npx prisma init`) and define the schema:
    - `User`, `Brand`, `Category`, `Product` (with `searchVector`).
- [x] Run `npx prisma db push` and seed the database with initial data.

---

## Phase 2: Authentication & Secure UI

### 2.1 Auth.js (v5) Backend
- [x] Install `next-auth@beta` and `bcryptjs`.
- [x] Configure `lib/auth.ts` (Credentials provider).
- [x] Ensure `jwt` and `session` callbacks expose the user's `role` (`ADMIN` | `USER`).

### 2.2 Stunning Auth Pages
- [x] Build `/auth/register` using a beautiful `shadcn/ui` Card layout.
- [x] Build `/auth/login`. 
- [x] Add `motion.dev` page transitions (e.g., smooth fade-in and slide-up on load).
- [x] Test the flow: Register a user in the UI, check Postgres, then log in.

### 2.3 RBAC Proxy & Navigation
- [x] Set up the RBAC Proxy to protect `/admin/*` routes.
- [x] Build a responsive, animated `<Navbar />` (shows Login button OR User Avatar dropdown depending on session state).

---

## Phase 3: Admin Dashboard & Product UI (Cloudinary)

### 3.1 Admin Dashboard Shell
- [x] Create `app/admin/layout.tsx` with a sleek, collapsible sidebar navigation.
- [x] Create `app/admin/page.tsx` showing summary stat cards using `motion` to animate the numbers counting up.

### 3.2 Cloudinary Integration
- [x] Get Cloudinary API keys and install `next-cloudinary`.
- [x] Build a reusable, drag-and-drop `<ImageUpload />` component.

### 3.3 Product Management (Admin UI)
- [x] Build `/admin/products` datatable using `shadcn/ui` Table.
- [x] Build `/admin/products/new` — an interactive form (with Cloudinary upload).
- [x] Test: Add a new product via the UI and verify it appears in Postgres.

---

## Phase 4: Public Product Pages & Redis Caching

### 4.1 Beautiful Product Listing
- [x] Build `/products` grid. Use `motion` for hover effects on `<ProductCard />`.
- [x] Build the `/products/[id]` detail page UI (Hero section, Specs, Sticky summary bar).

### 4.2 Cache-Aside Pattern (Redis Strings)
- [x] Update `GET /api/products/[id]` to cache the JSON profile in Redis (`product:profile:{id}`).
- [x] Build the `<CacheBanner />` component. It should visibly pop up (using `motion`) to show "⚡ Redis Cache Hit: 2ms" or "🐢 Database Read: 200ms" (aggregated from Postgres and MongoDB) so we can literally *see* Redis working in the UI.

---

## Phase 5: The Moderation Pipeline (MongoDB)

### 5.1 MongoDB Review Schema
- [x] Update `types/index.ts` to support the full Review document (status, pros, cons, brandResponse).

### 5.2 Public Review Form
- [x] Build `<ReviewForm />` on the product page using `shadcn` forms and validation.
- [x] Add interactive Star Rating selector.
- [x] On submit: Save to MongoDB as `PENDING`. Show a `toast` success message.

### 5.3 Admin Moderation UI
- [x] Build `/admin/reviews` — a queue of `PENDING` reviews.
- [x] Add animated Approve (✅) and Reject (❌) buttons.

### 5.4 Advanced Redis Stats (Hashes)
- [x] When Admin clicks Approve in the UI:
    - Route fires `HINCRBY product:stats:{id}` to instantly update avg rating.
- [x] Refresh the product page UI to visually confirm the new star rating.

---

## Phase 6: Search, Discovery & SEO

### 6.1 Animated Search Bar
- [x] Add full-text `tsvector` search to Postgres.
- [x] Build `GET /api/search` with Redis caching (`search:{queryHash}`).
- [x] Build `<SearchBar />` in the Navbar. As the user types, a `motion` dropdown instantly reveals cached results.

### 6.2 SEO & Breadcrumbs
- [x] Build `<BreadcrumbNav />` using `shadcn/ui` breadcrumbs.
- [x] Inject JSON-LD structured data into the `<head>` of product pages.

---

## Phase 7: Community & Interactivity

### 7.1 User Profiles
- [x] Build `/profile/[id]` showcasing the user's avatar, review history, and helpfulness score.

### 7.2 Upvote / Downvote (Redis Sets)
- [x] Add animated 👍 / 👎 buttons to reviews on the product page.
- [x] API checks `SISMEMBER` in Redis. If successful, use Zustand to instantly increment the vote count in the local UI without a full page reload.

### 7.3 Review Flagging
- [x] Add a "Report" dropdown to reviews.
- [x] Flagged reviews appear in a new `/admin/reviews/flagged` dashboard.

---

## Phase 8: Leaderboards, Polish & Scale

### 8.1 Redis Leaderboards (Sorted Sets)
- [ ] Implement `ZINCRBY trending:products` on product views.
- [ ] Build a "Trending This Week" carousel on the Landing Page (`/`).

### 8.2 Product Comparison
- [ ] Build `/products/compare?a=1&b=2`.
- [ ] Display side-by-side `<ComparisonTable />` highlighting pros/cons and rating differences.

### 8.3 Rate Limiting & Polish
- [ ] Protect `POST /api/reviews` using Redis `INCR` + `EXPIRE` (max 5 per hour). Test it by spamming the UI button and verifying the error toast.
- [ ] Integrate Resend for "Welcome" and "Review Approved" emails.
- [ ] Final UI review: Check all skeleton loaders, error boundaries, and mobile responsiveness.
