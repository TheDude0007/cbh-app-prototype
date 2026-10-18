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
│   ├── index.html              # main prototype (canonical, has full OG/share meta)
│   ├── cbh-app-prototype.html  # earlier build of the same prototype, kept for reference
│   ├── favicon.png
│   ├── apple-touch-icon.png
│   ├── og-image.jpg
│   └── robots.txt              # blocks all crawling — this is an unlisted demo link
├── .github/workflows/pages.yml # GitHub Actions: deploys docs/ to Pages on every push to main
├── deploy.sh                   # one-command rollout to a fresh GitHub repo (see below)
├── vercel.json                 # tells Vercel to serve from docs/
└── LICENSE-ARCHIVO-OFL.txt     # font license (Archivo, embedded in the HTML)
```

Both HTML files are single self-contained pages — all CSS/JS inline, no external calls except to SoundCloud for the embedded players. Open `docs/index.html` directly in a browser to preview locally; no server needed.

## For a coding agent picking this up

- There is no build step and no package.json — don't go looking for one.
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

- [ ] Open the live link on your own phone first — Safari and Chrome both.
- [ ] Text yourself the link and confirm the preview card renders (logo + title + description).
- [ ] Tap Play on a headliner and confirm the SoundCloud player actually loads audio.
- [ ] Open the Multipass rail and confirm the flyers render.
- [ ] Switch to the owner portal view and run through the sample flyer-to-show flow.
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
