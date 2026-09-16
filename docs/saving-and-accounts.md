# Saving, and signing in with ChatGPT

Architecture Studio saves a room in up to two places, and the interface never
blurs the two. This note covers what each one means, and what a deployment needs
to offer the second.

## What the header says

The chip under the project name is the whole save state. It only ever reports
what actually happened:

| Chip | Means |
| --- | --- |
| **Not saved yet** | The room exists in this tab and nowhere else. |
| **Unsaved changes** | Edited since the last save. The second line says when that was. |
| **Saving…** | A save is in flight. |
| **Saved on this device** | Written to this browser's storage. Not anywhere else. |
| **Saved to your account** | In the account *and* on this device. |
| **Not saved** | The browser refused to store it — private mode, blocked site data, or no quota left. |

Clicking the chip opens a panel that names both destinations separately, says
where the room currently is, and spells out what "this device" costs you:
clearing site data, or opening the studio on another machine, will not find it.

A room can legitimately be safe on this device while the account copy is stale.
That is reported as **Saved on this device** with *"Your account copy is out of
date"* rather than a single blended "saved", because the two fail independently.

## Device saving

Two separate things live in `localStorage`:

- **Saved projects** (`studio.projects.v1`) — what you pressed Save on. These
  are what the Project menu lists and what "Saved on this device" refers to.
- **The open draft** (`studio.draft.v1`) — a crash-safe copy of the editor as it
  stands, written continuously. It is *never* presented as a save. If you close
  the tab mid-edit, reopening restores it and still says **Unsaved changes**.

There is no autosave. Save is explicit (the button, or `⌘S` / `Ctrl+S`), and
leaving with unsaved changes warns first.

## Account saving

Optional, and off unless the deployment is configured for it. When it is off,
`/api/auth/session` reports `configured: false` and the studio hides the account
UI rather than showing a button that cannot work.

### What is stored

A saved room carries everything needed to reopen it exactly as it was:

- the furniture, with each piece's position, rotation and **finish**
- the room's **dimensions**
- the **view settings** — 2D or 3D, the grid and dimension toggles, the plan's
  pan and zoom, and the 3D camera's angle and distance

### The sign-in flow

Standard OpenID Connect authorization code flow with PKCE, run as a
*confidential* client:

1. `GET /api/auth/start` mints a PKCE verifier and state, stores them against a
   short-lived id in an `HttpOnly` cookie, and redirects to OpenAI.
2. OpenAI returns to `GET /api/auth/callback`, which checks the state, exchanges
   the code **on the server** (so the client secret never reaches the browser),
   reads the `id_token` claims, and creates a session.
3. The browser is left holding one opaque session id in an `HttpOnly; Secure;
   SameSite=Lax` cookie. No OpenAI token is ever sent to the page.

Endpoints come from the issuer's `/.well-known/openid-configuration` rather than
being hardcoded. The `id_token` is checked for issuer, audience and expiry; its
signature is not re-verified, which OpenID Connect Core §3.1.3.7 allows when the
token came straight from the token endpoint over TLS with the client
authenticating itself.

### Configuration

Copy `.env.example` and set:

| Variable | Purpose |
| --- | --- |
| `OPENAI_CLIENT_ID`, `OPENAI_CLIENT_SECRET` | Your OpenAI platform app. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Vercel KV / Upstash Redis. `UPSTASH_REDIS_REST_*` also works. |
| `OPENAI_ISSUER`, `OPENAI_SCOPE` | Optional overrides. |
| `STUDIO_PUBLIC_ORIGIN` | Optional. Pins the redirect URI's origin. |

Register `https://<your-domain>/api/auth/callback` as the app's redirect URI.

The store is reached over the Redis REST protocol with plain `fetch`, so the
project keeps its zero-dependency deploy — there is no `package.json` and
nothing to install. API routes use the `.mjs` extension so Vercel's Node runtime
treats them as ES modules without one.

### Keys

| Key | Holds | TTL |
| --- | --- | --- |
| `studio:txn:<id>` | One in-flight sign-in (state, PKCE verifier, return path) | 10 min |
| `studio:sess:<id>` | A session's account claims | 30 days |
| `studio:index:<sub>` | Hash of room summaries for the Project menu | — |
| `studio:room:<sub>:<id>` | One full room document | — |

Every key is namespaced by the account's `sub`, so a session can only read or
write its own rooms. Documents are re-validated server-side by
`api/_lib/room.mjs`, which is deliberately independent of the browser code:
it is the trust boundary, so it re-derives the shape from scratch rather than
importing the client's idea of it. Rooms are capped at 100 per account and 200
pieces each.

## Endpoints

| Route | Does |
| --- | --- |
| `GET /api/auth/session` | Whether accounts are configured, and who is signed in. |
| `GET /api/auth/start` | Begins the sign-in redirect. |
| `GET /api/auth/callback` | Completes it and sets the session cookie. |
| `POST /api/auth/signout` | Drops the session. |
| `GET /api/rooms` | Room summaries for the signed-in account. |
| `GET /api/rooms?id=…` | One room in full. |
| `PUT /api/rooms` | Create or replace a room. |
| `DELETE /api/rooms?id=…` | Remove one. |
