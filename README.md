# ColoradoBassHeads — App Prototype

A clickable prototype of the ColoradoBassHeads fan app and owner portal, built to sit alongside Multipass: timed location drops, push alerts, SoundCloud players for headliners, Multipass show links, a fan CRM, and flyer-to-show posting. Two static pages, no build step, no server, no dependencies.

**Live:**
- GitHub Pages — https://thedude0007.github.io/cbh-app-prototype/
- Vercel — https://cbh-app-prototype.vercel.app/
- Alternate build — https://thedude0007.github.io/cbh-app-prototype/cbh-app-prototype.html (also at `/cbh-app-prototype.html` on the Vercel URL)

## Repo structure

```
.
├── docs/                       # the entire site — this is what gets deployed
│   ├── index.html              # main prototype (canonical, has full OG/share meta, installable PWA)
│   ├── cbh-app-prototype.html  # earlier build, no icons/manifest — an embed-style copy, not installable
│   ├── manifest.webmanifest    # PWA manifest — only index.html links to this
│   ├── sw.js                   # minimal service worker (network-first, cache fallback) for installability
│   ├── icon-192.png / icon-512.png  # generated from apple-touch-icon.png for the home-screen icon
│   ├── favicon.png
│   ├── apple-touch-icon.png
│   ├── og-image.jpg
│   └── robots.txt              # blocks all crawling — this is an unlisted demo link
├── .github/workflows/pages.yml # GitHub Actions: deploys docs/ to Pages on every push to main
├── deploy.sh                   # one-command rollout to a fresh GitHub repo (see below)
├── vercel.json                 # tells Vercel to serve from docs/
├── tests/smoke.mjs             # Playwright smoke test — automates the "before you present" checklist below
├── package.json                 # only for tests/ — the site itself still has no build step
└── LICENSE-ARCHIVO-OFL.txt     # font license (Archivo, embedded in the HTML)
```

Both HTML files are single self-contained pages — all CSS/JS inline, no external calls except to SoundCloud for the embedded players. Open `docs/index.html` directly in a browser to preview locally; no server needed.

**Add to Home Screen:** `docs/index.html` is a real installable PWA. On Android/Chrome/desktop Chrome, an install icon appears next to the bell once the browser fires its install prompt (tap it to install directly). On iOS Safari, which has no install-prompt API, the same icon opens a 3-step instruction sheet (Share → Add to Home Screen → Add) using the app's existing sheet UI. `cbh-app-prototype.html` intentionally has none of this — it's the lighter embed-style copy.

**Visual identity:** display text (titles, kickers, countdowns, tab labels) uses Unbounded, a bold geometric display face loaded from Google Fonts — kept separate from the Archivo body font so headings carry real character instead of reading as one flat typographic voice. The bottom tab bar is a floating glass pill with a sliding glow indicator (JS-positioned via `positionTabIndicator()`) rather than a flat edge-to-edge row. The "Now playing" panel layers an ambient canvas laser sweep (`#lasers`, mirrors the lifecycle of the existing `#terrain` wireframe — same start/stop/reduced-motion pattern) behind the terrain wireframe. The existing pointer-tilt holographic sheen (originally ticket/flyer cards only) now also covers the Multipass rail cards and the hero photo. Artifact coins got an animated holographic ring.

## For a coding agent picking this up

- The **site** has no build step and no dependencies — `docs/` is plain HTML, don't go looking for a bundler.
- There IS a `package.json`, but it exists only to run the Playwright smoke test in `tests/` — it has nothing to do with deploying the site.
- All edits happen directly in `docs/index.html` (or `docs/cbh-app-prototype.html`). It's one long HTML file with inline `<style>` and `<script>`.
- Pushing to `main` auto-deploys both GitHub Pages (via the Actions workflow) and Vercel (the repo is linked — Vercel watches `main` too).
- If you add a new asset, put it in `docs/` so it ships with the deploy.
- Keep `<meta name="robots" content="noindex, nofollow">` and `docs/robots.txt` in place unless this is becoming the real public site — see Privacy below.

## Update or roll back

- **Update:** edit the file in `docs/`, commit, push to `main`. Both GitHub Pages and Vercel redeploy automatically, usually within a minute.
- **Roll back:** `git revert HEAD && git push`, or re-run an earlier deploy from the repo's Actions tab (GitHub Pages) or the Vercel dashboard's deployment history.

## Go live somewhere new, in one command

Needs `git` and the [GitHub CLI](https://cli.github.com), logged in with `gh auth login`.

```bash
./deploy.sh cbh-app-prototype
```

Creates (or reuses) the named public repo, turns on GitHub Pages via Actions, pushes, and prints the live link. First deploy takes about a minute.

## Before you present this to the CEO

Run the automated check first — it covers the functional items below against both live URLs in about 20 seconds:

```bash
npm install
npx playwright install chrome   # first run only
npm test
```

It verifies: both sites return 200, the title is correct, tapping Play actually loads a live SoundCloud iframe, the Multipass flyer images resolve for real (direct HTTP checks against the S3 URLs, not just "an `<img>` tag exists"), the Owner portal switch works, the full AI-flyer-read → Publish flow completes, and there are no console or JS errors. A failure prints exactly which check broke.

Then do these by hand — no script can check these for you:

- [ ] Open the live link on your own phone — Safari and Chrome both.
- [ ] Text yourself the link and confirm the preview card renders (logo + title + description).
- [ ] If presenting on a shared screen, use the Vercel URL (`cbh-app-prototype.vercel.app`) — it's shorter and reads cleaner on a projector than the GitHub Pages path.

## What's real and what's demo

- **Real:** the ColoradoBassHeads logo art, Multipass show links and flyers, Multipass follower and event counts (October 2026), and the SoundCloud pages for MORBEATO, Shank Aaron, Basstroyd, and SWANDO.
- **Demo:** show names, dates, prices, fan counts, sales numbers, and the venue address. Lineups use Basscapital NYE artists as examples, not confirmed bookings.
- **Simulated:** payments, texts, AI flyer reading, and the Multipass sync.

Worth saying out loud in the room: this is a *clickable prototype*, not a connected backend. Nothing here charges a card, sends a real text, or writes to Multipass.

## Custom domain (optional)

Add a `CNAME` file inside `docs/` containing the domain, e.g. `app.coloradobassheads.com`. Point a DNS CNAME record for that subdomain at `thedude0007.github.io`, then enter the domain under the repo's Settings → Pages.

## Privacy

This repo and site are public (GitHub's free Pages tier requires it), but `docs/robots.txt` and the page's `noindex` meta tag keep it out of search engines. Anyone with the exact link can still open it — don't post the link anywhere public.

## Credits

The Archivo typeface by Omnibus-Type is embedded under the SIL Open Font License 1.1 — see `LICENSE-ARCHIVO-OFL.txt`.
