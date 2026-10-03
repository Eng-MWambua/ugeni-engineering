/* SECURITY NOTE on innerHTML below:
   The interpolated values come only from window.SITE.accreditations, which is a
   first-party file in this repo edited by the site owner (site.config.js) — not
   from user input, query strings, or any remote feed. Every interpolated value
   still passes through escapeHtml(), and URLs additionally through escapeAttr()
   which strips javascript: schemes. If accreditation data ever moves to a CMS or
   remote API, replace this with DOM construction (textContent) instead.
   ========================================================================== */

/* ==========================================================================
   Renders SITE.accreditations into the Accreditations section.
   Add entries to window.SITE.accreditations in site.config.js and they appear.
   While the list is empty it renders an honest "in progress" state rather than
   an empty box or invented registrations.
   ========================================================================== */
(function () {
  "use strict";

  var grid = document.querySelector("[data-acc-grid]");
  if (!grid) return;

  var items = (window.SITE && window.SITE.accreditations) || [];

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
      '</span></' + tag + '>';
  }).join("");

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/javascript:/gi, "");
  }
})();