# Live Deployment (GitHub Pages)

This repo is configured to deploy automatically to **GitHub Pages** via:

- `.github/workflows/deploy-pages.yml`

## One-time repo settings

1. Push this branch to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, set **Source = GitHub Actions**.

## Go live

- Merge/push to `main`.
- The workflow runs and publishes the static game.
- Live URL format:
  - `https://<your-github-username>.github.io/<repo-name>/`

## Local preview

From repo root:

```bash
python -m http.server 8080
```

Then open:

- `http://localhost:8080/`

