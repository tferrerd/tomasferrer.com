# Tomas Ferrer — personal website

Astro source for https://tomasferrer.com.

## Local development

Use Node.js 24.22.1 or a newer patched 24.x LTS release, then run:

```sh
npm ci
npm run dev
```

## Publishing

In repository Settings → Pages, choose GitHub Actions as the source. Pushes to `main` build and deploy automatically using the official Astro action.

Set the custom domain to `tomasferrer.com` in Settings → Pages, then configure the records described in `docs/domain-setup.md`. Enable HTTPS once the certificate is available.

## Editing

- `src/data/profile.ts`: experience, education, contact information, and logo paths.
- `src/pages/index.astro`: homepage copy and Selected Work.
- `src/styles/global.css`: styling.
- `public/`: downloadable résumé, photo, and logos.

`npm run build` generates the static site in `dist/`.

## Profile AI guide

The optional “Talk to my AI agent” chat uses public website content and a private-key
backend. See [setup and deployment](docs/profile-agent.md). Set the GitHub Actions
variable `PUBLIC_AGENT_URL` after deploying the backend to make the launcher visible.
