# Sparrow landing page

Marketing site for Sparrow, by Ravenry. One static file, no build step.

- `index.html` is the whole site. Four pages (home, how it works, why on-device, design partners) are routed by URL hash: `#/`, `#/how`, `#/device`, `#/partners`.
- Fonts load from Google Fonts. Everything else is inline.
- The design-partner form composes an email. Set the real address in `CONTACT_EMAIL` near the top of the script before going live.

To preview locally, open `index.html` in a browser or serve the folder with any static server.
