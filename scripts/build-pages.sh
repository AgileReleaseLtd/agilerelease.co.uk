#!/usr/bin/env bash
# Build the GitHub Pages bundle: site/ -> _site/.
#
#   bash scripts/build-pages.sh          # writes _site/ and checks it; exit 0 = ready to publish
#
# The GitHub Actions workflow (.github/workflows/pages.yml) runs exactly this script, then publishes
# _site/ as the Pages artifact. Run it locally to see what will be published.
#
# What it does, in order:
#   1. copies site/ to _site/ (site/ itself is never modified);
#   2. writes js/ga4-config.js from GA4_MEASUREMENT_ID in pages.conf (the id is checked: G- plus
#      4-20 capitals/digits, anything else fails the build);
#   3. removes HTML comments from every page;
#   4. adds the Content-Security-Policy and referrer policy as <meta> tags right after
#      <meta charset>, before anything the page loads. The policy allows Google Analytics hosts only
#      when GA4_MEASUREMENT_ID is set. (frame-ancestors is not allowed in a <meta> CSP, so it is left out.)
#   5. checks the result, and fails if anything is not as expected.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../pages.conf
source "${ROOT}/pages.conf"
: "${SITE_APEX:?pages.conf must set SITE_APEX}"
GA4_MEASUREMENT_ID="${GA4_MEASUREMENT_ID:-}"

SRC="${ROOT}/site"
OUT="${ROOT}/_site"

die() { echo "build-pages: $*" >&2; exit 1; }

# Content-Security-Policy. CSP_STRICT applies when GA4_MEASUREMENT_ID is empty; CSP_GA4 when it is
# set. js/consent.js loads Google's tag (www.googletagmanager.com) only after the visitor accepts
# analytics cookies; gtag.js then sends hits to the collection hosts Google documents for GA4.
CSP_STRICT="default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'"
CSP_GA4="default-src 'none'; script-src 'self' https://www.googletagmanager.com; style-src 'self'; font-src 'self'; img-src 'self' https://*.google-analytics.com https://*.googletagmanager.com; connect-src https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; base-uri 'none'; form-action 'none'; object-src 'none'"
REFERRER="strict-origin-when-cross-origin"

command -v perl > /dev/null || die "perl is required"
[[ -f "${SRC}/index.html" ]] || die "site/index.html not found"
[[ ! -e "${SRC}/js/ga4-config.js" ]] || die "site/js/ga4-config.js must not be committed (this build writes it)"

# ── 1. copy ─────────────────────────────────────────────────────────────────────────────────────
rm -rf "$OUT"
cp -a "${SRC}/." "${OUT}/"

# ── 2. js/ga4-config.js ─────────────────────────────────────────────────────────────────────────
if [[ -n "$GA4_MEASUREMENT_ID" ]]; then
    printf '%s' "$GA4_MEASUREMENT_ID" | grep -Eqx 'G-[A-Z0-9]{4,20}' \
        || die "GA4_MEASUREMENT_ID '${GA4_MEASUREMENT_ID}' is not a GA4 measurement id (G- + 4-20 capitals/digits)"
    CSP="$CSP_GA4"
else
    CSP="$CSP_STRICT"
fi
printf 'window.siteGa4MeasurementId = "%s";\n' "$GA4_MEASUREMENT_ID" > "${OUT}/js/ga4-config.js"

# ── 3 + 4. pages: strip comments, add the policy <meta> tags ────────────────────────────────────
mapfile -t PAGES < <(cd "$OUT" && find . -name '*.html' -type f | sed 's|^\./||' | sort)
[[ "${#PAGES[@]}" -ge 1 ]] || die "no pages found"
for p in "${PAGES[@]}"; do
    CSP="$CSP" REFERRER="$REFERRER" perl -0777 -i -pe '
        # A comment on a line of its own goes with its line; any other comment just goes.
        s{^[ \t]*<!--.*?-->[ \t]*\n}{}gms;
        s{<!--.*?-->}{}gs;
        # The policy must come before anything the page loads, so it goes right after <meta charset>.
        my $tags = qq{\n    <meta http-equiv="Content-Security-Policy" content="$ENV{CSP}">}
                 . qq{\n    <meta name="referrer" content="$ENV{REFERRER}">};
        s{(<meta charset="UTF-8">)}{$1$tags} == 1 or die "no single <meta charset=\"UTF-8\"> in $ARGV\n";
    ' "${OUT}/${p}"
done

# ── 5. checks ───────────────────────────────────────────────────────────────────────────────────
fail=0
bad() { echo "  FAIL: $*" >&2; fail=1; }

[[ "$(cat "${OUT}/js/ga4-config.js")" == "window.siteGa4MeasurementId = \"${GA4_MEASUREMENT_ID}\";" ]] \
    || bad "js/ga4-config.js does not carry GA4_MEASUREMENT_ID"
[[ "$CSP" != *frame-ancestors* ]] || bad "the <meta> CSP names frame-ancestors (ignored in a <meta>)"
if [[ -n "$GA4_MEASUREMENT_ID" ]]; then [[ "$CSP" == *googletagmanager* ]] || bad "GA4 is on but the CSP allows no Google host"
else [[ "$CSP" != *google* ]] || bad "GA4 is off but the CSP names a Google host"; fi

for p in "${PAGES[@]}"; do
    f="${OUT}/${p}"
    ! grep -q -e '<!--' -e '-->' "$f" || bad "${p}: an HTML comment is still there"
    [[ "$(grep -c 'http-equiv="Content-Security-Policy"' "$f")" == 1 ]] || bad "${p}: not exactly one CSP <meta>"
    # The first two elements after <head> are <meta charset> and the CSP <meta>.
    head_start="$(tr -d '\n' < "$f" | grep -o -E '<head>[[:space:]]*<meta[^>]*>[[:space:]]*<meta[^>]*>' || true)"
    [[ "$head_start" == *'<meta charset="UTF-8">'*'http-equiv="Content-Security-Policy"'* ]] \
        || bad "${p}: the CSP <meta> is not directly after <meta charset> at the top of <head>"
    # What the strict policy relies on: no inline script (JSON-LD data blocks are not scripts), no
    # inline styles, no on*= handlers.
    inline_js="$(grep -o -E '<script[^>]*>' "$f" | grep -v -E 'src=' | grep -v -F 'application/ld+json' || true)"
    [[ -z "$inline_js" ]] || bad "${p}: inline <script>: ${inline_js}"
    ! grep -q -E '<style|[[:space:]]style="' "$f" || bad "${p}: <style> block or style= attribute"
    ! grep -q -E '<[^>]+[[:space:]]on[a-z]+[[:space:]]*=' "$f" || bad "${p}: on*= event handler"
    # Removing comments must remove nothing else: the page minus its comments and minus the two added
    # <meta> lines is the source page minus its comments.
    diff -q <(perl -0777 -pe 's{^[ \t]*<!--.*?-->[ \t]*\n}{}gms; s{<!--.*?-->}{}gs' "${SRC}/${p}") \
            <(grep -v -E '^    <meta (http-equiv="Content-Security-Policy"|name="referrer") ' "$f") > /dev/null \
        || bad "${p}: differs from site/${p} by more than comments and the two policy <meta> tags"
done

# Every other file is published byte-for-byte.
while IFS= read -r -d '' f; do
    rel="${f#"${SRC}"/}"
    [[ "$rel" == *.html ]] && continue
    cmp -s "$f" "${OUT}/${rel}" || bad "${rel}: not copied byte-for-byte"
done < <(find "$SRC" -type f -print0)

[[ "$fail" -eq 0 ]] || die "checks failed; _site/ must not be published"
echo "build-pages: _site/ ready for ${SITE_APEX} (${#PAGES[@]} pages; Google Analytics: ${GA4_MEASUREMENT_ID:-off})"
