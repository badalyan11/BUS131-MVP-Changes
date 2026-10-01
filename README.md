# Life Journal (MVP)

People live meaningful moments but rarely write them down. This app makes that effortless: describe
a moment in your own simple words, add a photo if you want, and a writing assistant turns it into a
polished journal page, kept in a journal you flip through like a real book.

> Turn life's moments into stories worth keeping.

A journal isn't just about a child anymore — it can be about any meaningful part of life: a
childhood, a relationship, a family, a trip, a wedding, a semester abroad, anything. Journals come
in two modes:

- **Ongoing** — a journal you keep adding to over time (a childhood, a relationship, family life).
- **Experience** — a complete journal built after something already happened (a trip, a wedding, a
  birthday).

This is a first MVP built to test three things: whether people want an easier way to turn rough
notes into well-written memories, whether they want to organize those into beautiful journals for
different parts of their life, and whether they'd want a printed copy. See `/stats` for a running
count. It intentionally has no accounts, sharing, or printing/payments — see "What's not here yet."

## Tech stack

- **React + TypeScript + Vite** — frontend, single page app
- **Tailwind CSS** — styling, with per-journal designs (colors, fonts, page style) applied inline
- **React Router** — client-side routing between screens
- **Browser `localStorage`** — all data (journals, memories/pages, photos as compressed base64
  images, book-interest clicks) is stored in the browser. No database, no server required to run it.
- **Cloudflare Workers (static assets)** — `wrangler.jsonc` deploys the built `dist/` folder as a
  static site, with SPA fallback so client-side routes work on refresh/deep-link.
- **`functions/api/generate-entry.ts`** — a stub server route for a real AI call later. Not wired up
  under the current Workers deployment (see "Connecting a real AI" below) — the app works fully
  without it via the offline writing assistant.

## Project structure

```
1st MVP/
├── functions/
│   └── api/
│       └── generate-entry.ts     # Optional server route for a real AI call
├── src/
│   ├── components/
│   │   ├── DesignPicker.tsx      # Preset or custom journal design, with live preview
│   │   ├── JournalCover.tsx      # Renders a journal's cover in its own design
│   │   └── PageSurface.tsx       # Renders a page background (plain/lined/dotted/vintage)
│   ├── context/
│   │   └── AppContext.tsx        # Journals, memories, book-interest state + localStorage
│   ├── lib/
│   │   ├── color.ts              # Picks readable text color over a cover color
│   │   ├── generateJournalEntry.ts  # THE writing assistant — mock now, swappable for real AI
│   │   ├── journalTypes.ts       # Journal types, idea chips, tone mapping, design presets
│   │   ├── photo.ts              # Resizes/compresses uploaded photos before storing
│   │   └── storage.ts            # localStorage read/write helpers
│   ├── pages/
│   │   ├── Welcome.tsx           # First-run explainer screen
│   │   ├── MyJournals.tsx        # Grid of journal covers (home screen)
│   │   ├── CreateJournal.tsx     # 4-step journal creation wizard
│   │   ├── JournalView.tsx       # The flip-book journal viewer
│   │   ├── JournalSettings.tsx   # Edit journal details/design, or delete it
│   │   ├── NewMemory.tsx         # "What happened?" — the core capture screen
│   │   ├── ReviewMemory.tsx      # Review/edit a written memory (used for new + edit)
│   │   ├── OrganizePages.tsx     # Reorder, edit, or delete pages
│   │   ├── BookPreview.tsx       # "Turn this into a book" preview + interest signal
│   │   └── Stats.tsx             # /stats — local MVP feedback counters
│   ├── App.tsx                   # Route definitions
│   ├── main.tsx                  # App entry point
│   ├── types.ts                  # Journal / Memory / BookInterest types
│   └── index.css                 # Tailwind entry point
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── wrangler.jsonc
└── vite.config.ts
```

## Running it locally

You'll need [Node.js](https://nodejs.org/) (v18 or later) installed.

```bash
npm install
```

```bash
npm run dev
```

This starts a local dev server (Vite will print a URL, typically `http://localhost:5173`).

### Try the full flow

1. On the welcome screen, click **Start my first journal**.
2. Pick **Keep adding over time** or **Create a journal from an experience**, then a type (e.g.
   Childhood, or Vacation / Travel), a design, and fill in the title/subject/point of view.
3. On the journal page, click **+ Add a memory**, write a rough note (try the idea chips), optionally
   add a photo and a date, then **Help me write this**.
4. On the review screen, try **Try another version**, **Make it shorter**, **Make it warmer**, or
   **Use my own words**, edit freely, then **Save to Journal**.
5. Flip through the journal with the arrow buttons or your keyboard's arrow keys.
6. Try **Organize pages** to reorder, edit, or delete a page, and **Turn this into a book** to see
   the book preview and click **I'm interested**.
7. Visit `/stats` to see the local feedback counters update.
8. Refresh the page — everything is still there.

To start fresh, clear your browser's site data for the page (or use a private/incognito window),
since this MVP has no account system.

## Building for production

```bash
npm run build
```

Type-checks the project and outputs a static site to `dist/`. Preview it locally with:

```bash
npm run preview
```

## Environment variables

**None are required to run the MVP.** The writing assistant works out of the box using a built-in
offline rewrite (see `src/lib/generateJournalEntry.ts`) — no API key, no backend.

## Connecting a real AI (optional, post-MVP)

All memory writing goes through one function: `generateJournalEntry()` in
[`src/lib/generateJournalEntry.ts`](src/lib/generateJournalEntry.ts). It first tries
`POST /api/generate-entry`; if that route isn't available or fails, it falls back to an offline
rewrite (never invents facts, just wraps the user's own cleaned-up sentences in a tone-appropriate
opener/closer) so the app always works without setup.

This deployment uses Cloudflare Workers static assets (see `wrangler.jsonc`), which serves the
built site directly and doesn't run the `functions/` folder (that convention is specific to
Cloudflare's classic Pages product). To wire up a real AI call later, `/api/generate-entry` needs to
become part of a small Worker script (a `fetch` handler that serves static assets for normal pages
and calls the Anthropic API — key stored as a Worker secret, never in frontend code — for that one
route). Ask for help with this step when you're ready; no frontend code changes are needed once it's
in place.

## Deploying to GitHub + Cloudflare

1. **GitHub**: create a new repository, then from this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial MVP"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. **Cloudflare**: in the Cloudflare dashboard, under Workers & Pages, create a new application
   connected to your GitHub repo, with:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy` (uses the included `wrangler.jsonc`)

## What's in this MVP

Welcome screen, journal creation (two modes, journal types, preset or custom designs with live
preview, details), a flip-book journal viewer, capturing a memory with idea chips and an optional
photo/date, a tone-aware writing assistant (try another version / shorter / warmer / use own words),
editing and saving, organizing pages (reorder/edit/delete), a "turn this into a book" preview with an
interest signal, local feedback stats at `/stats`, persistence across refreshes, and a
mobile-responsive layout.

## What's not here yet (by design)

User accounts, sharing/collaboration, printing, payment, checkout, shipping, email collection,
print-ready export, multiple photos per page (the data model already supports a `photos` list for
later), a photo album editor, reminders/notifications, social features, and voice input. These are
deliberately out of scope for this first MVP and may come later based on user feedback.
