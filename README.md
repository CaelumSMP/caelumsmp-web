# CaelumSMP website

Public site in the D4 "Aurora Fest" style (see `DESIGN.md`), a staff dashboard, and an owner editor for the site's content.

```
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Pages

| Route | What |
|---|---|
| `/` | Home: hero, info bar (players, Discord, version, event countdown), latest news, features, podium, stats, join, team, rules |
| `/news`, `/news/[slug]` | News list with thumbnails, and articles |
| `/leaderboards?by=<stat>` | Full rankings per stat (playtime, blocks mined/placed, mobs, votes, deaths) |
| `/players`, `/players/[name]` | Player search and profiles (stats with rank, badges, activity) |
| `/team` | Team cards; click one for a profile modal |
| `/vote` | Vote sites, streak rewards, top voters |
| `/rules` | All house rules |
| `/staff`, `/staff/a` `/b` `/c` | Staff dashboard, three layout variants. `?as=helper\|mod\|admin\|owner&tab=<key>` |

Header: players online with Copy IP, Discord online with Join, Store, and a menu.

## Owner editing

Open a dashboard with `?as=owner`. Four extra tabs appear:

- **Site settings**: IP, version, season, Discord and store links, online counters (demo numbers or live), hero text, next event, features, rules, social links.
- **Blog posts**: list, create, edit, publish/unpublish, delete. The editor has headings, bold/italic/underline/strike, text colors, highlight, alignment, lists, quotes, dividers, links, and images (upload or link) positioned center, full width, or floated left/right. A live preview shows the news-list card and the full article. Ctrl+S saves.
- **Team** and **Vote sites**: editable, reorderable lists.

Saves go to `data/content.json` (created on first save; gitignored), and images to `data/uploads/`. Every public page refreshes right after a save. Delete `data/` to go back to the starting content in `app/_lib/content.ts`.

**Editing only works under `npm run dev` for now.** There is no login yet: `?as=` is a preview switch, not authentication. A production build refuses every write (`app/staff/owner/guard.ts`) until Discord OAuth checks the owner role there. `CAELUM_ALLOW_UNAUTHENTICATED_EDITS=1` overrides this for a private test server only; never set it on a public one.

## Code

- `app/aurora.module.css`: design tokens and shared blocks (`.neon`, `.badge`, `.btn`).
- `app/(site)/`: public pages and their components; `site.module.css` for the newer pages.
- `app/_lib/`: `content.ts` (editable content types + starting content), `store.ts` (read/write `data/content.json`), `status.ts` (live counters via api.mcsrvstat.us and Discord's invite API, cached 60s), `editor.ts` (the one TipTap schema + sanitiser), `Rich.tsx` (renders saved posts without raw HTML).
- `app/_ui/`: shared pieces: `data.ts` (demo player stats, to be replaced by the server's stats plugin), `art.tsx` (pixel sprites, `Cube`), `Timer`, `CopyIp`, `Sparkline`, `useLeaderboard`.
- `app/staff/`: dashboard (`data.ts` roles/tabs/permissions, `Panels.tsx`, guides) and `owner/` (forms, post editor, server actions, validation, write guard).
- `app/api/upload`, `app/uploads/[file]`: image upload and serving.

Skin renders come from `visage.surgeplay.com` and `mc-heads.net`. Not affiliated with Mojang or Microsoft.

## Deploying (Coolify)

Unlike the store, this site needs a **Node runtime** — it has server actions, an
upload route and dynamic player pages, so it can't be exported as static files.

| Setting | Value |
|---|---|
| Build command | `npm ci && npm run build` |
| Start command | `npm run start` |
| Port | 3000 |

**`data/` must be a persistent volume.** The owner dashboard writes
`data/content.json` and `data/uploads/` at runtime, and the directory is
gitignored. Without a mounted volume every redeploy silently resets the site to
the seed content in `app/_lib/content.ts` and loses uploaded images.

Mount a volume at `/app/data`. The site runs fine on a fresh install without it —
`readContent()` falls back to the seed — which is exactly why the data loss would
go unnoticed.
