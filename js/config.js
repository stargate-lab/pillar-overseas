// Single source of truth for site-wide settings.
// WhatsApp number must be digits only, in international format, no "+", no spaces
// (e.g. Sri Lanka mobile 077 123 4567 -> "94771234567").
window.PILLAR_CONFIG = {
  whatsappNumber: "94770000000", // TODO: replace with the real business WhatsApp number

  // Google Apps Script Web App /exec URL (see apps-script/Code.gs) — optional,
  // parked for now (blocked by the stargatebs.com Workspace policy on public
  // deployments; lead capture runs on Netlify Forms instead, see js/main.js).
  // Leave blank to skip lead-sheet saving and only open WhatsApp.
  leadSheetUrl: ""
};
