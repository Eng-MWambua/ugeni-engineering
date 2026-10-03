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

  /* ---------- Energy audit compliance check ----------
     The one interactive thing on the page. A facility manager types their
     monthly consumption and gets an indicative position against the
     threshold in SITE.energyAudit.

     It deliberately does NOT give a determination. It reports what the
     published threshold implies, and then says to confirm with EPRA —
     because the site's own rule is that a stale regulatory figure is worse
     than no figure. Near the threshold it says so explicitly rather than
     picking a side, since that is exactly where the arithmetic is least
     trustworthy. */

  (function complianceCheck() {
    var form = $("[data-check-form]");
    if (!form) return;
    var cfg = S.energyAudit || {};
    var out = $("[data-check-out]");
    var input = $("[data-check-input]", form);

    var fmt = new Intl.NumberFormat("en-KE");

    function verdictFor(annual) {
      var t = cfg.thresholdKwhYear;
      if (!t) return null;
      // Within 10% of the line: refuse to call it either way.
      if (Math.abs(annual - t) / t <= 0.1) {
        return {
          cls: "",
          head: "Close to the threshold",
          body: "You are within about 10% of the current threshold, and this is " +
                "exactly the range where the answer depends on how your " +
                "consumption is measured and which exemptions may apply. " +
                "Confirm it with EPRA before assuming you are in or out."
        };
      }
      if (annual > t) {
        return {
          cls: "check__verdict--in",
          head: "Likely above the threshold",
          body: "At " + fmt.format(annual) + " kWh a year you sit above the " +
                "current " + fmt.format(t) + " kWh threshold, which points to a " +
                "statutory audit being required and a " + cfg.cycleYears +
                "-year cycle applying. Confirm the current position with EPRA."
        };
      }
      return {
        cls: "check__verdict--out",
        head: "Likely below the threshold",
        body: "At " + fmt.format(annual) + " kWh a year you sit below the " +
              "current " + fmt.format(t) + " kWh threshold, so a statutory " +
              "energy audit is not indicated on consumption alone. A voluntary " +
              "audit can still pay for itself. Confirm with EPRA if the figure " +
              "is close to your billing boundary."
      };
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var monthly = parseFloat(input.value);
      if (!isFinite(monthly) || monthly <= 0) {
        // Clear any previous verdict. Leaving it up would show a result that
        // no longer matches what is in the field, which is worse than showing
        // nothing at all.
        if (out) {
          out.hidden = true;
          var h = $("[data-check-head]", out);
          var b = $("[data-check-body]", out);
          if (h) h.textContent = "Enter your average monthly consumption";
          if (b) b.textContent = "A figure on your electricity bill is enough. " +
            "The result is indicative — confirm the current position with EPRA.";
        }
        input.focus();
        return;
      }
      var v = verdictFor(monthly * 12);
      if (!v || !out) return;

      var head = $("[data-check-head]", out);
      var body = $("[data-check-body]", out);
      head.textContent = v.head;
      head.className = "check__verdict" + (v.cls ? " " + v.cls : "");
      body.textContent = v.body;
      out.hidden = false;
    });
  })();

  /* ---------- Scroll reveal ----------
     Adds .is-in as elements enter. .reveal is only ever made visible by
     this, and the no-js / reduced-motion fallbacks in CSS keep content
     readable if this never runs. */
  (function reveal() {
    var els = $$(".reveal, .step");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
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