#!/usr/bin/env bash
set -euo pipefail

# Reuse checkout's authenticated origin without exposing a token in a URL.
root=$(git rev-parse --show-toplevel)
output=$(mktemp -d)
trap 'rm -rf "$output"' EXIT
cp "$root/google_scholar_crawler/results/gs_data.json" "$output/"
cp "$root/google_scholar_crawler/results/gs_data_shieldsio.json" "$output/"

branch=google-scholar-stats
remote_ref=$(git ls-remote --heads origin "refs/heads/$branch")
if [[ -n "$remote_ref" ]]; then
  git fetch origin "$branch"
  git switch -C "$branch" FETCH_HEAD
else
  git checkout --orphan "$branch"
  git rm -rf --ignore-unmatch .
fi

cp "$output/gs_data.json" "$output/gs_data_shieldsio.json" "$root/"
git add gs_data.json gs_data_shieldsio.json
if git diff --cached --quiet; then
  echo 'Citation data unchanged.'
  exit 0
fi
git -c user.name='github-actions[bot]' \
    -c user.email='41898282+github-actions[bot]@users.noreply.github.com' \
    commit -m 'Update citation data'
git push origin "HEAD:refs/heads/$branch"
