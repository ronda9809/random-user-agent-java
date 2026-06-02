# Deploying to Cloudflare Pages

The app is a static site, so it deploys to **Cloudflare Pages** with one command.

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

This builds the app and runs:

```bash
wrangler pages deploy dist --project-name ca-dmv-practice-test
```

On the first run it creates the Pages project automatically and prints the live
URL, e.g. `https://ca-dmv-practice-test.pages.dev`. Re-running redeploys.

## Notes

- The project name is set in `package.json` (`deploy` script) and `wrangler.toml`.
  Change `ca-dmv-practice-test` in both if you want a different URL.
- No backend or environment variables are needed at runtime — it's fully static
  and stores results in the browser's localStorage.
