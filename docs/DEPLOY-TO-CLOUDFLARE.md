# Deploying to Cloudflare Pages

The app is a static HTML file. No server, no database, no runtime build step.
Cloudflare Pages hosts it for free.

The app builds to `dist/`, which contains two files:

| File | Why it exists |
|---|---|
| `index.html` | The whole app. This is the only required file. |
| `_headers` | Security headers plus `noindex`, so an account list never reaches Google. |

Run `npm run build` first if `dist/index.html` is missing.

---

## Option A, and the one this repo is set up for: push to main

`.github/workflows/deploy.yml` builds the app, runs the 38 checks, refuses to
publish if any real client data has crept into the source, then deploys `dist/`
to Cloudflare Pages.

Add two secrets once, under **Settings → Secrets and variables → Actions**:

- **`CLOUDFLARE_API_TOKEN`** — in Cloudflare, go to **My Profile → API Tokens →
  Create Token** and use the **Edit Cloudflare Workers** template. It needs
  `Account → Cloudflare Pages → Edit`.
- **`CLOUDFLARE_ACCOUNT_ID`** — on the right of any domain overview page in
  Cloudflare, and also in the dashboard URL when you are logged in.

Create the Pages project once with the name `zamstars-abm-os`, either by pushing
or by the drag and drop route below. After that, every push to `main` publishes,
and every pull request runs the checks without deploying.

---

## Option B: drag and drop, about three minutes

Good for getting a link up before a meeting.

1. Go to **dash.cloudflare.com → Workers & Pages → Create → Pages → Upload assets**.
2. Project name `zamstars-abm-os`. That becomes `zamstars-abm-os.pages.dev`.
3. Drag the **`dist` folder** onto the upload area. Include `_headers`, not just
   `index.html`.
4. Press **Deploy site**. Live in about thirty seconds.

To update later, use **Create new deployment** on the same screen. Every
deployment keeps its own preview URL, so rolling back is easy.

---

## Option C: wrangler from your machine

```bash
npm install -g wrangler
wrangler login

npm run build
wrangler pages deploy dist --project-name=zamstars-abm-os
```

Add `--branch=preview` to publish to a preview URL instead of production, which
is useful for checking a client's data before it goes live.

---

## Option D: let Cloudflare watch the repo

1. Push this repository to GitHub or GitLab.
2. **Workers & Pages → Create → Pages → Connect to Git**.
3. Build settings: **Framework preset** `None`, **Build command** `npm run build`,
   **Output directory** `dist`.

If you take this route, delete `.github/workflows/deploy.yml` so the two systems
are not both deploying.

---

## Lock it down before you send anyone the link

A `.pages.dev` URL is readable by anyone who has it. The demo programme is
fictional so that is fine, but the moment you host a real one, put a login in
front of it.

### Cloudflare Access, free for up to 50 users

1. Open the **Zero Trust** dashboard → **Access → Applications → Add an
   application → Self-hosted**.
2. Application domain: your `zamstars-abm-os.pages.dev`, or your custom domain.
3. Add a policy: **Action** `Allow`, **Include → Emails ending in**
   `@zamstars.com`, plus any specific client addresses.
4. Save. Everyone now gets a one-time PIN by email before the page loads.

Also worth doing: preview deployment URLs are public by default. Either disable
preview access in **Settings**, or put Access in front of
`*.zamstars-abm-os.pages.dev` too.

### Custom domain

**Settings → Custom domains → Set up a domain**, then `abm.zamstars.com`. If
`zamstars.com` is already on Cloudflare the DNS record is created for you and the
certificate takes a few minutes.

---

## Two things to know about how it behaves once hosted

**1. Data lives in the browser, not on Cloudflare.** Every edit saves to that
browser's local storage. So the URL is the application and the JSON is the data.
If you edit a programme on your laptop, a colleague opening the same link sees
the shipped demo, not your work. Use **Export** and **Import** to move it. This
is deliberate: no client account list ever sits on a server.

If you later want genuinely shared state, that means a Cloudflare Worker plus a
KV or D1 binding. It is real work rather than a config toggle, and only worth it
if more than two people need to edit the same programme.

**2. "Analyse business" calls an outside service.** The beta URL reader fetches
`https://r.jina.ai/<url>` from the visitor's browser. `_headers` deliberately
does not set a strict `Content-Security-Policy`, because one would block that
call. If your security review wants a CSP, add this and accept that Analyse stops
working:

```
  Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'
```

The app is built to survive that. When the fetch fails it falls back to the
manual industry picker and everything else runs normally.

---

## Checking the deployment

Open the live URL and confirm:

- The left rail runs from **Start Here** through to **Our Method**.
- **The account list** shows a spread across all three tiers.
- Drop the **Reference value** weight to zero and the tier counts move.
- **Dashboard** renders the coverage bars and the tier by journey heatmap.
- Press **P** and presenter notes appear along the bottom.

If the page loads but looks unstyled, the file went into a subfolder. `index.html`
has to sit at the root of the deployment.
