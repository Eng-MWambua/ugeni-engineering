/* ==========================================================================
   SITE CONFIG — edit this one file to update the whole site.
   Contact details, social links and firm identity live here.
   Anything set to "" is automatically hidden from the page.
   ========================================================================== */

window.SITE = {
  firm: {
    name: "Ugeni Engineering",
    legalName: "",              // e.g. "Ugeni Engineering Ltd" — add when incorporated
    tagline: "Energy, environmental and mechanical engineering for Kenyan industry.",
    city: "Nairobi",
    country: "Kenya",
    founded: "",
    // Registered office / postal address — leave "" until you have one
    address: ""
  },

  contact: {
    phoneDisplay: "0742 6670 29",
    phoneDial: "+254742667029",       // tel: link format, no spaces
    email: "markwambua031@gmail.com",
    // Where the contact form posts. Empty = mailto fallback (works with no backend).
    // To use a real backend later, put your endpoint here, e.g.
    //   formEndpoint: "https://formspree.io/f/xxxxxxx"
    formEndpoint: ""
  },

  /* Social links — paste real profile URLs as you create them.
     Leave as "" to hide that icon automatically. */
  social: {
    linkedin: "",
    x: "",              // formerly Twitter
    facebook: "",
    instagram: "",
    youtube: ""
  },

  /* Accreditations & registrations.
     Each entry: { label, detail, url }.

     Add the actual licence/registration NUMBER to `detail` once you have the
     certificate in hand — clients do check these against the regulator's
     register, and a number that does not verify is worse than no number.

     `url` is optional: leave it "" for a plain card, or set it to the
     regulator's licence register to let visitors verify you themselves. */
  accreditations: [
    {
      label: "EPRA Energy Audit Firm",
      detail: "Licensed energy audit firm",
      number: "",              // ← paste the licence number when ready
      url: ""
    },
    {
      label: "NEMA Lead Expert",
      detail: "Licensed EIA and environmental audit expert",
      number: "",              // ← paste the licence number when ready
      url: ""
    }
  ],

  /* Energy audit compliance check (the interactive tool on the homepage).

     These figures are the site's single most regulation-sensitive data, so
     they live here rather than being hardcoded in JS. They are displayed to
     visitors as an indicative position, never as a determination, and the
     page repeats the confirm-with-EPRA instruction. If EPRA moves the
     threshold or the cycle, this is the only place to change it. */
  energyAudit: {
    thresholdKwhYear: 180000,   // facilities above this are in scope
    cycleYears: 4,
    asAt: "2026-10-03"          // date this was last checked against EPRA
  },

  /* Floating WhatsApp button.
     Digits only, no "+" and no spaces — wa.me needs the bare international
     number. When this is "" the button is removed from the page entirely
     (see main.js), so it can never render as a link that goes nowhere. */
  whatsapp: "254742667029"
};