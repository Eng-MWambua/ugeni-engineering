# Ugeni Engineering — website

Marketing and lead-generation site for Ugeni Engineering, Nairobi.

Static HTML, CSS and vanilla JS. No build step, no framework, no bundler.
It works when opened from disk and when served by any static host.

## Run locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Structure

```
index.html                 single page (all sections)
blog/index.html            Insights (blog) listing
blog/<post>.html           one file per post
blog/_template.html        copy this to start a new post
blog/build-post.py         scaffolds a post from the template (authoring aid)
assets/css/main.css        design tokens + styles
assets/css/blog.css        blog listing + article typography
assets/js/site.config.js   ← EDIT THIS for contact details, socials,
                             accreditations + licence numbers, and the
                             energy-audit threshold figures
assets/js/main.js          nav, theme, form, compliance check, reveal, social
assets/js/accreditations.js renders the accreditations section
assets/img/favicon.svg
assets/og/card.html        source for the share image
assets/og/og-image.png     rendered 1200x630 og:image — see below
robots.txt / sitemap.xml / feed.xml
```

## Making changes

**Contact details, social links, accreditations** all live in
`assets/js/site.config.js`. Change them there and every page updates.
Anything left blank (`""`) is automatically hidden rather than rendered
as a broken or placeholder link.

| Want to… | Do this |
|---|---|
| Change phone / email | edit `contact` in `site.config.js` |
| Add social profiles | paste URLs into `social` in `site.config.js` |
| Add a registration | push `{label, detail, url}` onto `accreditations` |
| Add a WhatsApp link | set `whatsapp: "2547…"` in `site.config.js` — digits only, no `+`. Drives the floating button on every page. |
| Change colours / spacing | edit the `:root` tokens at the top of `main.css` |

The floating WhatsApp button sits bottom-right on every page and is
config-driven, so it follows the same rule as the social icons: with
`whatsapp` empty, `main.js` **removes the element**, so the site never shows a
chat button that dead-ends. Its `href` is hardcoded in each HTML file as a
no-JS fallback, so keep it in step with `site.config.js` if the number changes.

Social icons do not appear on the live site until a real URL is supplied —
the site never renders a link that goes nowhere.

## The energy audit threshold check

The homepage has an interactive tool: enter average monthly kWh, get an
indicative position against the statutory threshold.

**It is not a determination and must never read like one.** It reports what
the published threshold implies, then tells the visitor to confirm with EPRA.
Within 10% of the line it refuses to call it either way, because that is
exactly where the arithmetic is least trustworthy. Every branch ends in the
confirm-with-the-regulator instruction.

The figures live in `site.config.js` under `energyAudit`:

```js
energyAudit: {
  thresholdKwhYear: 180000,
  cycleYears: 4,
  asAt: "2026-10-03"      // when this was last checked against EPRA
}
```

**If EPRA moves the threshold or the cycle, that block is the only thing to
edit** — the tool reads it, it is not hardcoded in `main.js`. Update `asAt`
at the same time, and re-check the homepage copy and the blog post, which
quote the same figures in prose.

## Accreditation licence numbers

Each entry in `accreditations` accepts an optional `number`. When present it
renders as a `Reg. no.` chip on the card; when absent, nothing renders. There
is never a placeholder, because a registration number a client checks against
the regulator's register must be a real one.

```js
{ label: "EPRA Energy Audit Firm", detail: "Licensed energy audit firm", number: "", url: "" }
```

Until numbers are published the page says the numbers are available on
request and invites the client to check them against the register. That is
deliberate: it asks the buyer to verify rather than asserting verification.

## The share image (og:image)

`assets/og/og-image.png` is a 1200x630 typographic card. Regenerate it after
copy changes:

```bash
cd assets/og
google-chrome --headless=new --no-sandbox --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 \
  --screenshot=og-image.png --virtual-time-budget=9000 card.html
```

It is typographic on purpose. No stock photography: a generic photo of factory
workers would read as "no work to show", which is the credibility problem the
rest of the site avoids. When real KVM project material exists, a drawing or
site photo is the upgrade worth making.

**Do not put the `ugen.engineering` domain on the card** — it does not
resolve, and a share image should not advertise an address that fails.

## Contact form

The form works with **no backend**: with `formEndpoint` empty it composes a
`mailto:` with the enquiry pre-filled and opens the visitor's mail client.

To collect submissions properly, set an endpoint in `site.config.js`:

```js
formEndpoint: "https://formspree.io/f/your-id"
```

The same form then posts JSON and shows a success or failure state. Works
with Formspree, Netlify Forms, Basin, or a Cloudflare Worker.

## Accreditations

The section currently renders an honest "registrations in progress" state.
When each registration is issued, add it to `accreditations` in the config
and it appears automatically.

**Do not add a registration number before the certificate is in hand.**
Publishing a number EBK, NEMA or EPRA cannot verify is a compliance
offence, not a marketing shortcut.

## Writing a blog post

```bash
python3 blog/build-post.py "Your post title" your-post-slug
```

That creates `blog/<today>-your-post-slug.html` with the site header and
footer already injected, and the remaining `{{TOKENS}}` for you to fill.
It is an authoring aid only — the generated HTML is the artifact and the
site never needs building again.

Then:
1. Fill the tokens: `{{KICKER}}`, `{{TITLE}}`, `{{STANDFIRST}}`,
   `{{BODY}}`, `{{READING TIME}}`, the callout note.
2. Add a `<a class="post-row">` block to `blog/index.html`, newest first.
3. Add the URL to `sitemap.xml` and an `<item>` to `feed.xml`.

**Before publishing anything about regulation:** check the claim against
the current regulator position. Kenya's energy and environment rules move,
and a stale number in a blog post is worse than no post — it is findable,
quotable by competitors, and hard to retract. Anything time-sensitive
belongs behind a callout that tells readers to confirm.

Article bodies use semantic HTML only (`<p>`, `<h2>`, `<ul>`, `<table>`),
styled by `.prose` in `blog.css`. No inline styles. Use `<aside
class="callout">` for asides — markup is in `_template.html`.

## Deploying

Any static host works — GitHub Pages, Netlify, Cloudflare Pages, Vercel,
or plain nginx. No build command; publish the repo root.

For GitHub Pages: Settings → Pages → deploy from branch `main`, root.

## Notes

- The canonical URL is the GitHub Pages URL,
  `https://eng-mwambua.github.io/ugeni-engineering/`. It used to point at
  `https://ugen.engineering/`, but that domain does not resolve (NXDOMAIN, no
  NS records), and a canonical tag plus sitemap pointing at a dead host asks
  search engines to consolidate your pages onto a URL that serves nothing.
  **When the real domain is registered AND actually serving**, change all of
  these in one pass — they are not all in one file:
  - `index.html` — canonical, `og:url`, JSON-LD `url`
  - `blog/index.html`, `blog/*.html`, `blog/_template.html` — canonical, `og:url`
  - `sitemap.xml`, `feed.xml`, `robots.txt`
- **Structured data (JSON-LD) in `index.html` is static, NOT wired to
  `site.config.js`.** An earlier version of this README claimed it updated
  automatically; it does not. `main.js` touches phone/email text and `tel:`
  hrefs only. When the phone or email changes you must edit the JSON-LD
  `telephone` and `email` in `index.html` by hand, or Google keeps serving
  stale contact data to search results.
- Light/dark theme persists in `localStorage` and respects the OS setting.