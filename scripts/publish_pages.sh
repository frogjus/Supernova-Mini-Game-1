#!/usr/bin/env bash
set -euo pipefail

HTTPS_URL_DEFAULT="https://github.com/frogjus/Supernova-Mini-Game-1.git"
LIVE_URL="https://frogjus.github.io/Supernova-Mini-Game-1/"

if git remote get-url origin >/dev/null 2>&1; then
  ORIGIN_URL="$(git remote get-url origin)"
else
  ORIGIN_URL=""
fi

if [[ -z "$ORIGIN_URL" ]]; then
  echo "No 'origin' remote found. Adding origin (HTTPS)..."
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    git remote add origin "https://x-access-token:${GITHUB_TOKEN}@github.com/frogjus/Supernova-Mini-Game-1.git"
  else
    git remote add origin "$HTTPS_URL_DEFAULT"
  fi
else
  # rewrite SSH origin to HTTPS to avoid port-22 restrictions
  if [[ "$ORIGIN_URL" == git@github.com:* ]]; then
    echo "Rewriting SSH origin to HTTPS for publish compatibility..."
    git remote set-url origin "$HTTPS_URL_DEFAULT"
  fi
fi

CURRENT_BRANCH="$(git branch --show-current)"
echo "Current branch: $CURRENT_BRANCH"

echo "Pushing current HEAD to origin/main..."
git push origin HEAD:main

echo

echo "Published trigger sent."
echo "If Pages source is set to GitHub Actions, your site will deploy to:"
echo "$LIVE_URL"
echo
echo "Check workflow run:"
echo "https://github.com/frogjus/Supernova-Mini-Game-1/actions/workflows/deploy-pages.yml"
