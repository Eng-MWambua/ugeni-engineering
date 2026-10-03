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
assets/css/main.css        design tokens + styles
assets/js/site.config.js   ← EDIT THIS for contact details & socials
assets/js/main.js          nav, theme, form, social wiring
assets/js/accreditations.js renders the accreditations section
assets/img/favicon.svg
robots.txt / sitemap.xml
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
| Add a WhatsApp link | set `whatsapp: "2547..."` |
| Change colours / spacing | edit the `:root` tokens at the top of `main.css` |

Social icons do not appear on the live site until a real URL is supplied —
the site never renders a link that goes nowhere.

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

## Deploying

Any static host works — GitHub Pages, Netlify, Cloudflare Pages, Vercel,
or plain nginx. No build command; publish the repo root.

For GitHub Pages: Settings → Pages → deploy from branch `main`, root.

## Notes

- Structured data (JSON-LD) in `index.html` carries the phone and email —
  update it alongside `site.config.js` when contact details change.
- The canonical URL is `https://ugen.engineering/`. Update the canonical
  tag, `robots.txt` and `sitemap.xml` if the real domain differs.
- Light/dark theme persists in `localStorage` and respects the OS setting.