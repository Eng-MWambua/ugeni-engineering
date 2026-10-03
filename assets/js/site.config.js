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

  /* Accreditations & registrations — populate as they are issued.
     Each entry: { label, detail, url }. Empty array = section renders
     as a "registrations in progress" state rather than disappearing. */
  accreditations: [],

  /* Optional: link to a live chat / booking widget
     e.g. cal.com embed, Tawk.to, WhatsApp click-to-chat */
  whatsapp: ""         // e.g. "254742667029"
};