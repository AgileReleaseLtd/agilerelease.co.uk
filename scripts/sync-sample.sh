#!/usr/bin/env bash
# Copy a sample website into site/, so it is published at https://agilerelease.co.uk/<repo>/.
#
#   bash scripts/sync-sample.sh website01-fitness-class            # repo in ~/workspace/<name>
#   bash scripts/sync-sample.sh website01-fitness-class path/to/repo
#
# Sample websites live in their own repos, named websiteNN-business-type (AgileReleaseLtd on GitHub).
# This copies what is committed on the sample's main branch (git archive), never uncommitted edits, into
# site/<repo>/, replacing that folder whole so files deleted in the sample go too. README.md, tests/ and
# dot files stay behind. Then run scripts/build-pages.sh, which checks the copied pages like any other.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
die() { echo "sync-sample: $*" >&2; exit 1; }

name="${1:-}"
[[ "$name" =~ ^website[0-9]{2}(-[a-z0-9]+)+$ ]] || die "usage: sync-sample.sh websiteNN-business-type [repo path]"
repo="${2:-${HOME}/workspace/${name}}"
git -C "$repo" rev-parse --verify -q main > /dev/null || die "${repo} is not a git repo with a main branch"

commit="$(git -C "$repo" rev-parse --short main)"
if pushed="$(git -C "$repo" rev-parse --verify -q origin/main)"; then
    [[ "$pushed" == "$(git -C "$repo" rev-parse main)" ]] \
        || echo "sync-sample: warning: ${name} main (${commit}) differs from origin/main; push the sample too" >&2
else
    echo "sync-sample: warning: ${name} has no origin/main; it is not on GitHub yet" >&2
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
git -C "$repo" archive main | tar -x -C "$tmp"
rm -rf "${tmp}/README.md" "${tmp}/tests"
find "$tmp" -mindepth 1 -maxdepth 1 -name '.*' -exec rm -rf {} +
[[ -f "${tmp}/index.html" ]] || die "${name} has no index.html at the top of main"

dest="${ROOT}/site/${name}"
rm -rf "$dest"
mkdir -p "$dest"
cp -a "${tmp}/." "${dest}/"
echo "sync-sample: site/${name}/ now holds ${name} at ${commit} ($(find "$dest" -type f | wc -l) files)"
