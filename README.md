# solid-convex-app

SolidJS + Tailwind CSS UI scaffold for a Convex-backed SaaS.

## Tech

- SolidJS + TypeScript
- Tailwind CSS (dark mode + responsive layout)
- Vite + pnpm

## Run

```bash
pnpm install
pnpm dev
```

## Convex Sample Connection

This repository now includes a minimal Convex sample table integration.

1. Add your Convex URL in `.env.local`:

```bash
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

`CONVEX_URL` also works because Vite is configured to expose `CONVEX_` variables.

2. Start Convex and the app in separate terminals:

```bash
pnpm convex:dev
pnpm dev
```

3. Open the Dashboard tab and use the "Convex Sample Table" card to insert and view rows.

## Build

```bash
pnpm build
```

## Design Tokens

Theme tokens are defined in `src/index.css` under `:root` and `.dark` using semantic CSS variables.

- Surface tokens: app background and shared panel/card/flyout surfaces.
- Text tokens: primary, muted, and subtle text colors.
- Border tokens: default, muted, and strong border contrast levels.
- Action tokens: brand, focus ring, and semantic tone colors (success, danger, info).

Reusable token-backed classes are also declared in `src/index.css`:

- Surface classes: `surface-panel`, `surface-card`, `surface-muted`, `surface-elevated`, `surface-flyout`
- Utility classes: `text-muted`, `text-subtle`, `text-danger`, `tone-success`, `tone-danger`, `tone-info`
- Controls: `btn-variant-*` classes and `input-field`

When adding new UI, prefer these semantic classes/tokens over hardcoded color utilities so light/dark themes stay consistent.

## Included Screens

- Login (default)
- Sign Up
- Password Reset
- SaaS Dashboard

Current mock flow:

- App opens on Login screen
- Clicking Login routes to Dashboard view
- Sign Up and Reset Password are scaffolded UI states
