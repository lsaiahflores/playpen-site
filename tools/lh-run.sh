#!/bin/bash
# usage: lh-run.sh <base-url> <outdir>
export CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"
B="$1"; O="$2"; mkdir -p "$O"
for page in "" "download/"; do
  for preset in mobile desktop; do
    for run in 1 2 3; do
      n="$(echo "home-$page" | tr -d /)"
      f="$O/${n}-${preset}-${run}.json"
      if [ "$preset" = desktop ]; then extra="--preset=desktop"; else extra=""; fi
      npx -y lighthouse@12 "${B}${page}" --quiet --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility,best-practices,seo $extra --output=json --output-path="$f" >/dev/null 2>&1
    done
  done
done
echo finished
