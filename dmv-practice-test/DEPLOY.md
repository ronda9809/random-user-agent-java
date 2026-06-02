# Deploying to Cloudflare Pages

The app is a static site, so it deploys to **Cloudflare Pages** with one command.

## Live setup (as deployed)

The app is served at **<https://lehyani.com/dmv>** without disturbing the root
`lehyani.com` site. This works in two pieces:

1. **Pages project `ca-dmv-practice-test`** — built with base path `/dmv/` and
   uploaded so the app lives under `/dmv/` (also reachable at
   `https://ca-dmv-practice-test.pages.dev/dmv/`). Run `npm run deploy`.
2. **Worker `lehyani-dmv-router`** (`cloudflare/dmv-router/`) — routed to
   `lehyani.com/dmv` and `lehyani.com/dmv/*`, it reverse-proxies those paths to
   the Pages project. Everything else on `lehyani.com` is untouched. Deploy it
   with `npm run deploy:worker` (only needed if the worker or routes change).

Because the app is built with `--base=/dmv/`, the bare `pages.dev` **root** won't
work — use the `/dmv/` URL. The `deploy` script handles the base + staging
automatically.

## One-time setup

Provide two credentials (as environment variables / secrets, or exported in your
shell):

| Variable                | What it is                                                        |
| ----------------------- | ---------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | API token with **Account → Cloudflare Pages → Edit** permission. |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID.                                       |

Create the token at <https://dash.cloudflare.com/profile/api-tokens> (use a
Custom token with the *Cloudflare Pages: Edit* permission). Find the account ID
in the Cloudflare dashboard sidebar or on the Workers & Pages overview page.

## Deploy

```bash
cd dmv-practice-test
npm install        # first time only
npm run deploy
```

This builds the app with base `/dmv/`, stages it under `publish/dmv/`, and
uploads it to the Pages project. Re-running redeploys. (The Pages project must
exist first — it was created once with
`npx wrangler pages project create ca-dmv-practice-test --production-branch main`.)

### Alternative: log in instead of using a token

If you'd rather not create/share an API token, run a one-time interactive login
(opens a browser to authorize), then deploy — no `CLOUDFLARE_*` variables needed:

```bash
npx wrangler login
npm run deploy
```

## Alternative: a subdomain instead of a path

If you'd rather serve it at a whole subdomain (e.g. `dmv.yourdomain.com`) instead
of a path, you don't need the Worker at all — build with the default base
(`npm run build`), deploy `dist`, then in the dashboard go to Workers & Pages →
`ca-dmv-practice-test` → *Custom domains* → **Set up a domain**. Cloudflare adds
the DNS record and HTTPS automatically. (A subdomain is simpler; the path-based
`/dmv` setup above was chosen to keep everything under `lehyani.com`.)

## Notes

- The project name is set in `package.json` (`deploy` script) and `wrangler.toml`.
  Change `ca-dmv-practice-test` in both if you want a different URL.
- No backend or environment variables are needed at runtime — it's fully static
  and stores results in the browser's localStorage.
