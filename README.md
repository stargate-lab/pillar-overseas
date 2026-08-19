# Pillar — Landing Page

Single-page marketing site for Pillar Overseas Education and Foreign Employment
(Sri Lanka → Dubai training + placement pathway). Plain HTML/CSS/JS, no build step,
no framework.

## Project structure

```
index.html        Page markup
css/style.css      All styles
js/config.js       Site-wide settings (WhatsApp number, lead sheet URL)
js/main.js         WhatsApp link wiring + reserve-form validation + lead save
assets/            Logo, track, and video files (see "Brand assets" below)
apps-script/       Google Apps Script source for the lead-capture sheet
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

The reserve form opens as a popup modal (triggered by any element with
`data-open-reserve`, see `index.html`), pre-selecting a track when opened from
a track card's `data-track` attribute. `js/main.js` validates name, phone (Sri
Lankan mobile pattern), district, NIC (old 9-digit+letter or new 12-digit
format), and track before submitting. Invalid fields get inline error messages
and a red outline; on success the modal swaps from the form to a "Thanks,
{name}!" confirmation view with a Close button, and resets back to a fresh
form the next time it's opened.

## Lead capture

Every valid submission saves to **Netlify Forms** — no backend, no
third-party account, works the moment the site is deployed on Netlify.
`index.html`'s `<form>` carries the required `data-netlify="true"` /
`name="reserve"` / hidden `form-name` attributes, and `js/main.js`
(`saveLeadToNetlify`) submits to it via the AJAX pattern Netlify's docs
require, since the form's own submit is intercepted for validation and the
success-view swap. A hidden honeypot field (`bot-field`) filters spam.

Submissions show up under **Site → Forms** in the Netlify dashboard (free tier:
100/month), exportable as CSV, with optional email notifications per submission.
**Only works once actually deployed on Netlify** — it silently no-ops in local
dev (`npm run dev`) and on other hosts, same fire-and-forget/fail-safe pattern
as everything else here: it can't block or break the rest of the form flow.

**Parked alternative — Google Sheet via Apps Script:** `apps-script/Code.gs`
still exists for this and works the same way (set `leadSheetUrl` in
`js/config.js`), but the `stargatebs.com` Google Workspace blocks public
("Anyone") Apps Script web app deployments at the org level, so this needs
either a personal (non-Workspace) Google account or a Workspace admin enabling
"Let users publish web apps that can be accessed by anyone" under Admin
console → Apps → Google Workspace → Apps Script. Leave `leadSheetUrl` blank
(the default) to keep this inactive.

## Deployment

The site is fully static — no build command required on either platform.

**Netlify**
- Connect the repo, or run `netlify deploy --prod` from this directory.
- `netlify.toml` already sets the publish directory to `.`.

**Vercel**
- Connect the repo, or run `vercel --prod` from this directory.
- Vercel auto-detects a static `index.html` at the root; no config file needed.

## Sinhala translation

`index-si.html` is a full Sinhala translation of `index.html` — a separate
page/URL rather than a client-side toggle, so each language is independently
indexable by search engines (`<link rel="alternate" hreflang>` tags point each
page at the other) and gets a correct `lang="si"` / `lang="en"` attribute. It
shares `css/style.css` and `js/main.js` with the English page — no duplicated
code, only duplicated copy. A "සිංහල" / "English" link in the nav switches
between them.

Two things to know:
- **Font**: Inter has no Sinhala glyphs, so `index-si.html` additionally loads
  Noto Sans Sinhala from Google Fonts; `css/style.css` layers it in for
  Sinhala pages only via an `html[lang="si"] body{...}` rule.
- **JS-generated strings**: almost all copy lives in the HTML (translate it
  there), but `js/main.js` itself generates two strings at runtime (the "fix
  the highlighted fields" error and the "Thanks, {name}!" success title) — the
  `STRINGS`/`T` object near the top of that file holds both languages, keyed
  off `document.documentElement.lang`.

**⚠️ This translation has not been reviewed by a Sinhala speaker.** It was
drafted by Claude and needs review before going live — especially the FAQ,
fee, and "no guaranteed job" sections in `index-si.html`, which restate the
same legally/ethically sensitive claims as the English copy (see "Content
note" below) and must carry the same meaning exactly, not just read fluently.

## Content note

The "no guaranteed job" language and the milestone-based fee structure in
`index.html` are intentional (legal/ethical requirement for this business) —
do not alter that copy without checking with the business owner first.
