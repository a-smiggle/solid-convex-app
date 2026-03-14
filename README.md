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

## Convex Env File Template

Use the committed template to manage backend-only variables safely:

```bash
cp .env.convex.example .env.convex.local
pnpm convex env set --from-file .env.convex.local
```

Use `--prod` to target production deployment.

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

## Forgot Password Email (Resend)

Forgot-password requests now queue an internal Convex action that sends an email through Resend.

Set these environment variables in your Convex deployment (Dashboard -> Settings -> Environment Variables):

```bash
RESEND_API_KEY=your_resend_api_key
RESET_EMAIL_FROM=you@yourdomain.com
RESET_PASSWORD_URL=https://your-app.example
RESET_EMAIL_APP_NAME=Solid + Convex
```

Notes:

- `RESET_PASSWORD_URL` and `RESET_EMAIL_APP_NAME` are optional.
- If `RESEND_API_KEY` is missing, reset requests are still accepted but email delivery is skipped.
- When configured, reset emails include a one-time `resetToken` query param that expires after 30 minutes.
- The app consumes the token from the URL and shows the password update form automatically.

## GitHub OAuth Login

GitHub login is supported through an OAuth code flow exchanged on the Convex backend.

Set these in your Convex deployment environment variables:

```bash
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
```

Set this in your app frontend `.env.local`:

```bash
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
```

`VITE_GITHUB_CLIENT_ID` is also supported.

GitHub OAuth app callback URL should point to your app root (for local dev):

```bash
http://localhost:5173/
```

The app handles GitHub callback `code/state` params on load, creates a Convex session, then cleans callback params from the URL.

## Signup Email Verification

New email/password signups now require email verification before accounts become active.

Set these in your Convex deployment environment variables:

```bash
VERIFY_EMAIL_URL=http://localhost:5173/
VERIFY_EMAIL_FROM=admin@yourdomain.com
VERIFY_EMAIL_APP_NAME=Solid + Convex
```

Notes:

- `VERIFY_EMAIL_URL` is used to build links with a `verifyToken` query param.
- `VERIFY_EMAIL_FROM` and `VERIFY_EMAIL_APP_NAME` are optional; reset-email values are used as fallback.
- Users cannot sign in with email/password until verification completes.

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
- User Settings (opened from top-right user menu)

Current auth flow:

- App opens on Login screen
- Email/password login requires verified email
- Sign Up sends verification email and activates account only after verification
- Reset Password supports token-based completion
- GitHub OAuth login is supported from Login and account linking occurs on matching email
