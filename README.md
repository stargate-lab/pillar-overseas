# Pillar — Landing Page

Single-page marketing site for Pillar Overseas Education and Foreign Employment
(Sri Lanka → Dubai training + placement pathway). Plain HTML/CSS/JS, no build step,
no framework.

## Project structure

```
index.html        Page markup
css/style.css      All styles
js/config.js       Site-wide settings (WhatsApp number)
js/main.js         WhatsApp link wiring + reserve-form validation
assets/            Logo files (see "Brand assets" below)
netlify.toml       Netlify static-hosting config
package.json       Dev-server script only (no runtime dependencies)
```

## Brand assets

`assets/` holds the processed logo files used on the page, generated from the
original `pillar-overseas-logo-source.svg` and `group-ten-global-logo-source.png`
(also kept in `assets/` for reference):

- `pillar-icon-mark.png` — icon only, used in the nav and footer next to the "PILLAR" wordmark (reads on light backgrounds).
- `pillar-overseas-logo.png` — full icon + wordmark lockup, light-background use.
- `pillar-overseas-logo-on-dark.png` / `group-ten-global-logo-on-dark.png` — same logos with the grey text recolored light so they read on the site's black sections (about panel, footer).
- `group-ten-global-logo.png` — light-background version of the parent company mark.

Site colors are drawn directly from these two logos: blue `#0071BC`, black `#000000`,
and neutral greys for muted text — set as CSS custom properties at the top of
`css/style.css` (`--blue`, `--ink`, `--ink-2`, `--muted`).

## Setting the WhatsApp number

Edit `js/config.js`:

```js
window.PILLAR_CONFIG = {
  whatsappNumber: "94770000000" // digits only, country code, no "+"
};
```

This one value drives every WhatsApp link on the page (nav, hero, final CTA, footer)
and the reserve-form submit handler — nothing else needs to change.

## Local development

Requires [Node.js](https://nodejs.org) (for the dev server only — the site itself
ships zero JS dependencies).

```bash
npm install
npm run dev
```

This starts a live-reload server at `http://localhost:5500` and opens the page in
your browser. Any edit to `index.html`, `css/`, or `js/` refreshes automatically.

If you don't want Node installed at all, any static file server works, e.g.
`npx serve .` or the VS Code "Live Server" extension.

## Form validation

`js/main.js` validates name, phone (Sri Lankan mobile pattern), district, and
track before building the WhatsApp deep link. Invalid fields get inline error
messages and a red outline; the submit button shows a spinner and "Redirecting…"
while the WhatsApp tab opens, then re-enables itself.

## Deployment

The site is fully static — no build command required on either platform.

**Netlify**
- Connect the repo, or run `netlify deploy --prod` from this directory.
- `netlify.toml` already sets the publish directory to `.`.

**Vercel**
- Connect the repo, or run `vercel --prod` from this directory.
- Vercel auto-detects a static `index.html` at the root; no config file needed.

## Next steps (not yet built)

- **Sinhala-language toggle** — plan to externalize copy into a small strings
  object (e.g. `js/i18n.js`) keyed by section, with a toggle that swaps
  `textContent` and persists the choice in `localStorage`.
- **Real lead-capture backend** — the reserve form currently only opens a
  WhatsApp deep link (see `js/main.js`). Swapping in a backend means adding a
  `fetch()` call before (or instead of) `window.open()`, keeping the existing
  validation and loading-state logic as-is.

## Content note

The "no guaranteed job" language and the milestone-based fee structure in
`index.html` are intentional (legal/ethical requirement for this business) —
do not alter that copy without checking with the business owner first.
