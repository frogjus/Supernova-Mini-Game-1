# Publish Now (frogjus)

Target URL:

- https://frogjus.github.io/Supernova-Mini-Game-1/

## Fastest path

Run:

```bash
bash scripts/publish_pages.sh
```

This will:

1. Ensure `origin` remote is configured for `frogjus/Supernova-Mini-Game-1`.
2. Push current `HEAD` to `origin/main`.
3. Trigger `.github/workflows/deploy-pages.yml`.

## Required one-time GitHub setting

In GitHub repo settings:

- **Settings → Pages → Source = GitHub Actions**

## Verify deployment

- Workflow runs at:
  - https://github.com/frogjus/Supernova-Mini-Game-1/actions/workflows/deploy-pages.yml
- Live URL:
  - https://frogjus.github.io/Supernova-Mini-Game-1/
