/* SECURITY NOTE on innerHTML below:
   The interpolated values come only from window.SITE.accreditations, which is a
   first-party file in this repo edited by the site owner (site.config.js) — not
   from user input, query strings, or any remote feed. Every interpolated value
   still passes through escapeHtml(), and URLs additionally through escapeAttr()
   which strips javascript: schemes. If accreditation data ever moves to a CMS or
   remote API, replace this with DOM construction (textContent) instead.
   ========================================================================== */

/* ==========================================================================
   Renders SITE.accreditations into two places:
     1. the credential band directly under the masthead
     2. the Accreditations section further down the page
   Both read the same config array, so the band can never claim a
   registration the section does not. Add entries to window.SITE.accreditations
   in site.config.js and both update.
   While the list is empty it renders an honest "in progress" state rather than
   an empty box or invented registrations.
   ========================================================================== */
(function () {
  "use strict";

  var grid = document.querySelector("[data-acc-grid]");
  var band = document.querySelector("[data-cred-band]");
  var items = (window.SITE && window.SITE.accreditations) || [];

  /* ---------- Credential band ----------
     The seal glyph is inline SVG rather than initials: a circle with a
     check is a mark of assurance, whereas two letters in a circle reads
     as a social-media badge. */
  if (band) {
    var SEAL =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M20 6 9 17l-5-5"/></svg>';

    if (items.length) {
      var cells = items.map(function (a) {
        return '<div class="cred">' +
          '<span class="cred__mark" aria-hidden="true">' + SEAL + '</span>' +
          '<div class="cred__body">' +
          '<p class="cred__label">' + escapeHtml(shortLabel(a.label)) + '</p>' +
          '<p class="cred__text">' + escapeHtml(a.detail || a.label) +
          (a.number ? ' &middot; Reg. no. ' + escapeHtml(a.number) : "") +
          '</p></div></div>';
      }).join("");
      band.innerHTML = cells;
      /* Set the column count on THIS element. Wrapping the cells in a second
         .creds__in instead would place a single nested grid into column 1 of
         the outer 3-column track and stack them vertically. */
      band.style.gridTemplateColumns = items.length === 3
        ? "repeat(3, minmax(0, 1fr))"
        : "repeat(" + items.length + ", minmax(0, 1fr))";
    } else {
      band.innerHTML =
        '<div class="cred"><div class="cred__body">' +
        '<p class="cred__label">Registrations</p>' +
        '<p class="cred__text">Energy audit and environmental registrations are ' +
        'being confirmed. We will provide the numbers on request and they can be ' +
        'checked against the regulator\'s register before you appoint us.</p>' +
        '</div></div>';
    }
  }

  if (!grid) return;

  if (!items.length) {
    grid.innerHTML =
      '<div class="card-stat" style="grid-column:1/-1">' +
      '<h3 style="font-size:var(--fs-md)">Registrations in progress</h3>' +
      '<p class="small muted" style="margin:0">' +
      'Our EPRA-licensed firm registration, NEMA expert registration and EBK-registered engineering partners ' +
      'are being verified or renewed. If a licence shown is not yet reflected here, we ' +
      'deliver through our licensed partner network.' +
      '</p></div>';
    return;
  }

  grid.innerHTML = items.map(function (a) {
    var tag = a.url ? "a" : "div";
    var attrs = a.url ? ' href="' + escapeAttr(a.url) + '" target="_blank" rel="noopener noreferrer"' : "";
    var initials = (a.label || "?").replace(/[^A-Za-z ]/g, "").trim().split(/\s+/)
      .slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();

    return '<' + tag + ' class="acc"' + attrs + '>' +
      '<span class="acc__mark" aria-hidden="true">' + escapeHtml(initials) + '</span>' +
      '<span><span class="acc__label">' + escapeHtml(a.label) + '</span>' +
      (a.detail ? '<br><span class="acc__detail">' + escapeHtml(a.detail) + '</span>' : "") +
      // Licence number renders only when one is actually configured. Never a
      // placeholder — a number a client checks against the regulator's
      // register must be a real one.
      (a.number ? '<br><span class="licence"><b>Reg. no.</b> ' + escapeHtml(a.number) + '</span>' : "") +
      '</span></' + tag + '>';
  }).join("");

  /* "EPRA Energy Audit Firm" -> "EPRA Licensed". The band cell is narrow;
     the full label belongs in the section, not the strip. Falls back to the
     first two words when there is no licence-bearing word to find. */
  function shortLabel(label) {
    var s = String(label || "");
    var lic = s.match(/\b(EPRA|NEMA|EBK|DOSHS|CBK)\b/i);
    var kind = s.match(/\b(Energy Audit Firm|Lead Expert|Engineering Consult\w*|Firm of Experts)\b/i);
    if (lic && kind) return lic[1].toUpperCase() + " " + titleCase(kind[1]);
    if (lic) return lic[1].toUpperCase() + " Licensed";
    return s.split(/\s+/).slice(0, 2).join(" ");
  }
  function titleCase(s) {
    return s.toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/javascript:/gi, "");
  }
})();