# agilerelease.co.uk

The company website of **Agile Release Limited** (Company No. 13237670): a static site published with
[GitHub Pages](https://docs.github.com/en/pages) at **https://agilerelease.co.uk** (`www.agilerelease.co.uk` redirects to it).

## What is here

| Path | What it is |
| --- | --- |
| `site/` | The website, exactly as it is published, apart from what the build adds (below). Plain HTML, CSS and JavaScript; no build tools, no external fonts or scripts. |
| `pages.conf` | The site's settings: its domain and its Google Analytics 4 measurement id. |
| `scripts/build-pages.sh` | Builds `_site/` from `site/` and checks the result. |
| `.github/workflows/pages.yml` | Runs the build and publishes `_site/` to GitHub Pages. |
| `CNAME` | The custom domain, for reference. With the GitHub Actions publishing source the domain is set in Settings → Pages. |

## Publishing

Every push to `main` publishes the site. The workflow can also be run by hand from the **Actions** tab
(*Publish to GitHub Pages* → *Run workflow*).

To change the site: edit the files in `site/`, check the result locally (below), commit, push to `main`, and
watch the run in the **Actions** tab. A failed build publishes nothing; the previous version stays online.

### What the build adds

`scripts/build-pages.sh` copies `site/` to `_site/`, then:

- writes `js/ga4-config.js` from `GA4_MEASUREMENT_ID` in `pages.conf`. Empty = no cookie banner and nothing
  loaded from Google. With an id, `js/consent.js` shows an opt-in banner and loads Google Analytics only after
  the visitor accepts. Anything that is not a `G-` id fails the build;
- removes HTML comments from the pages;
- adds a `Content-Security-Policy` and a referrer policy as `<meta>` tags at the top of every page. The policy
  allows only this site's own files, plus Google Analytics' hosts when an id is set. Pages therefore must not use
  inline `<script>` code, `<style>` blocks, `style=` attributes or `on…=` handlers, or load anything from
  another site; the build fails if they do;
- checks that `site/sitemap.xml` lists exactly the published pages (https://<site>/ plus the page path, `index.html`
  as its directory), that a page's canonical link names that same URL, and that `site/robots.txt` names the
  sitemap. **Add every new page to `site/sitemap.xml`**, or mark it `<meta name="robots" content="noindex">`; the
  build fails otherwise.

### Check locally before pushing

```sh
bash scripts/build-pages.sh                 # builds _site/ and runs the checks
python3 -m http.server -d _site 8000        # then open http://localhost:8000/
```

`_site/` is not committed.

## One-time GitHub settings

- **Settings → Pages → Build and deployment → Source:** GitHub Actions.
- **Settings → Pages → Custom domain:** `agilerelease.co.uk`, then tick **Enforce HTTPS** once the certificate has been issued.
- The domain is verified for the organisation (organisation Settings → Pages), which stops anyone else's
  repository from claiming it.

## DNS

The domain's DNS points the apex at GitHub Pages (`A` and `AAAA` records) and `www` at the organisation's
`github.io` host (`CNAME`), as described in
[GitHub's custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
Mail records (`MX`, `SPF`, `DKIM`, `DMARC`) are separate and unaffected by the website.
