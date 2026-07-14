# Case Zero

Landing site for **Case Zero**, an inter-house cryptic hunt (Classes IX–XII, ~5 hour runtime, no points/penalties — ranking by furthest chapter reached).

Two pages:

| File | Purpose |
|---|---|
| `index.html` / `style.css` / `script.js` | Main landing page — briefing, format, method, house roster, countdown, and the "Fragment Zero" combination-lock puzzle. |
| `2.html` / `2.css` / `2.js` | "Records Division" sealed-archive terminal — a standalone puzzle page (Clerk's Notes 1–5) that feeds into an unseal code. |

Fonts (`jetbrains-mono-*.woff2`, `source-serif-4-*.woff2`) are self-hosted webfont files used by the pages' CSS.

## Running it

No build step — just open `index.html` (or `2.html`) in a browser, or serve the folder statically:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/index.html`.

## Editing per-school details (`script.js` → `CONFIG`)

```js
const CONFIG = {
  launchDate: new Date('2026-08-14T09:00:00+05:30'), // countdown target
  secretCode: '4471',                                 // Fragment Zero lock answer
  registerEmail: 'casezero@yourschool.edu',            // "Register Your Team" mailto
  houses: [ /* name, gloss, color, tagline per house */ ]
};
```

Also update the footer line in `index.html` with your actual school/committee name before publishing.

## `index.html` — features

- **Countdown** to `CONFIG.launchDate`, flips to a "LIVE" status pill automatically.
- **Scramble-reveal** hero tagline (decodes on load; respects `prefers-reduced-motion`).
- **Scratch-to-reveal** hidden text blocks (click/tap or keyboard Enter/Space to toggle).
- **Fragment Zero lock**: a 4-digit combination lock; correct answer is `CONFIG.secretCode`. The digit itself is hidden elsewhere on the page (invisible text node) as an in-universe clue.
- **House roster**, rendered from `CONFIG.houses`.
- **Nav-link scroll tracking** and **GSAP-powered staggered reveals** on scroll (IntersectionObserver-based; degrades gracefully without GSAP or with reduced motion).

## `2.html` / `2.js` — "Records Division" terminal

A themed puzzle page with 5 hidden "Clerk's Notes" that visitors collect by:

1. Reading an HTML comment in the page source (manually self-reported via a button).
2. Reading a styled `console.log` message (manually self-reported via a button).
3. Entering the **Konami code** (↑↑↓↓←→←→BA).
4. Typing the word **`gramercy`** anywhere on the page.
5. Selecting/highlighting a specific redacted line of text.

Progress (`notes` object) is **in-memory only** — no localStorage/cookies — so a page refresh is a genuine reset. There's also a decoy "intercepted transmission" (base64 → typewriter effect) that isn't one of the 5 real notes, plus a 4-tier hint system and an **Unseal Terminal** input whose correct code is checked against a djb2 hash (`TARGET_HASH`) rather than stored in plaintext, so the answer can't be read straight out of the source.

A "Reset Investigation" button clears all progress and panels back to initial state.

## Notes

- All puzzle logic is client-side and unauthenticated by design — this is a scavenger hunt, not a security boundary.
- No external dependencies besides Google Fonts and the GSAP CDN script (`index.html` only).
