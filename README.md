# agilerelease.co.uk

Static website for Agile Release Limited, served by GitHub Pages from the root of `main` (custom domain in `CNAME`).

Plain HTML/CSS/JS, no build step: edit the files and push to `main`, and GitHub publishes it.

- `js/ga4-config.js` holds the site's Google Analytics 4 measurement id (public). Leave it empty
  (`""`) to turn analytics and the cookie banner off. `js/consent.js` loads Analytics only after
  the visitor accepts.
- The Content-Security-Policy is a `<meta>` tag at the top of each page. Keep it identical on every
  page, and update it if a page needs another host.
