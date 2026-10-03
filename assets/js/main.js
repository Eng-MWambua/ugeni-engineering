/* ==========================================================================
   Ugeni Engineering — site behaviour
   Depends on window.SITE from site.config.js (loaded first).
   Progressive enhancement: the page works with JS off.
   ========================================================================== */
(function () {
  "use strict";

  var S = window.SITE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Theme ---------- */
  (function theme() {
    var root = document.documentElement;
    var btns = $$("[data-theme-toggle]");
    var saved = null;
    try { saved = localStorage.getItem("ue-theme"); } catch (e) {}

    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    apply(saved || (prefersDark ? "dark" : "light"));

    function apply(t) {
      root.setAttribute("data-theme", t);
      btns.forEach(function (b) {
        b.setAttribute("aria-label", "Switch to " + (t === "dark" ? "light" : "dark") + " theme");
      });
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        apply(next);
        try { localStorage.setItem("ue-theme", next); } catch (e) {}
      });
    });
  })();

  /* ---------- Mobile nav ---------- */
  (function nav() {
    var btn = $("[data-menu]");
    var el = $("#nav");
    if (!btn || !el) return;
    btn.addEventListener("click", function () {
      var open = el.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    });
    el.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        el.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && el.classList.contains("is-open")) {
        el.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      }
    });
  })();

  /* ---------- Inject contact details everywhere ---------- */
  (function contact() {
    var c = S.contact || {};
    $$("[data-phone-display]").forEach(function (e) {
      e.textContent = c.phoneDisplay || "";
      var a = e.closest("a");
      if (a && c.phoneDial) a.href = "tel:" + c.phoneDial;
    });
    $$("[data-email]").forEach(function (e) {
      e.textContent = c.email || "";
      var a = e.closest("a");
      if (a && c.email) a.href = "mailto:" + c.email;
    });
    var cta = $("[data-phone-cta]");
    if (cta && c.phoneDisplay) {
      cta.textContent = "Call " + c.phoneDisplay;
      if (c.phoneDial) cta.href = "tel:" + c.phoneDial;
    }

    var wa = $("[data-whatsapp]");
    if (wa && S.social && S.whatsapp) {
      wa.href = "https://wa.me/" + S.whatsapp.replace(/[^\d]/g, "");
      wa.removeAttribute("hidden");
    } else if (wa) { wa.remove(); }
  })();

  /* ---------- Social links ----------
     Rendered as visible placeholders so the block reads as complete. When a
     real URL exists in site.config.js the anchor is upgraded to a live link:
     href set, placeholder styling dropped, opened in a new tab. */
  (function social() {
    var cfg = S.social || {};
    $$("[data-social]").forEach(function (a) {
      var key = a.getAttribute("data-social");
      var url = (cfg[key] || "").trim();
      a.removeAttribute("hidden");

      if (url) {
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.classList.remove("is-placeholder");
        a.setAttribute("title", "Open " + key.charAt(0).toUpperCase() + key.slice(1));
        a.removeAttribute("aria-disabled");
      } else {
        // Keep it visible but inert: no keyboard stop, no dead navigation.
        a.setAttribute("aria-disabled", "true");
        a.setAttribute("tabindex", "-1");
        a.addEventListener("click", function (e) { e.preventDefault(); });
      }
    });
  })();

  /* ---------- Year ---------- */
  $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* ---------- Toast ---------- */
  var toastEl = $("[data-toast]");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-open");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-open"); }, 4200);
  }

  /* ---------- Contact form ----------
     Posts to a real endpoint when site.config.js has formEndpoint set.
     With no endpoint it composes a mailto: so the form still functions. */
  (function form() {
    var f = $("#enquiry");
    if (!f) return;

    var status = $("[data-form-status]");
    var endpoint = (S.contact && S.contact.formEndpoint) || "";

    function setStatus(msg, ok) {
      if (!status) return;
      status.textContent = msg;
      status.classList.remove("is-ok", "is-err");
      status.classList.add(ok ? "is-ok" : "is-err");
    }

    function validate() {
      var ok = true;
      $$("[required]", f).forEach(function (input) {
        var field = input.closest(".field");
        var good = input.value.trim() !== "" &&
                   (input.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim()));
        if (field) field.classList.toggle("field--error", !good);
        if (!good && ok) { input.focus(); ok = false; }
      });
      return ok;
    }

    $$("input, textarea, select", f).forEach(function (input) {
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field) field.classList.remove("field--error");
      });
    });

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) { setStatus("Please complete the highlighted fields.", false); return; }

      var data = {};
      new FormData(f).forEach(function (v, k) { data[k] = v; });

      if (endpoint) {
        var btn = $("[type=submit]", f);
        btn.disabled = true;
        btn.textContent = "Sending…";
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        }).then(function (r) {
          btn.disabled = false;
          btn.textContent = "Send enquiry";
          if (!r.ok) throw new Error("HTTP " + r.status);
          f.reset();
          setStatus("Thank you — your enquiry has been sent. We reply within one business day.", true);
        }).catch(function () {
          btn.disabled = false;
          btn.textContent = "Send enquiry";
          setStatus("Sending failed. Please email " + (S.contact && S.contact.email) + " directly.", false);
        });
        return;
      }

      // No endpoint configured: hand off to the visitor's mail client.
      var body = Object.keys(data).map(function (k) {
        return k + ": " + data[k];
      }).join("\n");
      var href = "mailto:" + (S.contact && S.contact.email) +
        "?subject=" + encodeURIComponent("Website enquiry — " + (data.service || "General")) +
        "&body=" + encodeURIComponent(body);
      window.location.href = href;
      setStatus("Opening your email client with the enquiry pre-filled. Send it and we'll reply shortly.", true);
    });
  })();

  /* ---------- Copy email to clipboard ---------- */
  $$("[data-copy-email]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var v = (S.contact && S.contact.email) || "";
      if (!v) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(v).then(function () {
          toast("Email address copied");
        }, function () { toast(v); });
      } else { toast(v); }
    });
  });

})();