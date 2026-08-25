# Deploying to Vercel

`vercel.json` in the repository root already tells Vercel everything it needs, so
importing the repo should just work. This page is for when it does not.

---

## Importing it

1. **vercel.com/new**, then import the GitHub repository.
2. Leave every setting alone and press **Deploy**.

Vercel reads `vercel.json` and gets:

| Setting | Value | Why |
|---|---|---|
| Framework | none | It is plain HTML, not a framework app |
| Build command | `npm run build` | Concatenates `src/` into `dist/index.html` |
| Output directory | `dist` | Vercel looks for `public` unless told otherwise |

---

## "No Output Directory named public found after the Build completed"

This is the one error you are likely to hit, and it means Vercel is not reading
`vercel.json`. That happens when the project was created before the file existed
and someone set the output directory by hand, because **dashboard settings
override the file**.

Fix it in **Project → Settings → Build & Deployment → Build & Output Settings**:

- **Framework Preset**: Other
- **Build Command**: toggle Override on, enter `npm run build`
- **Output Directory**: toggle Override on, enter `dist`

Save, then **Deployments → ⋯ → Redeploy**. Untick "Use existing build cache".

If you would rather the file win, clear those overrides so each field falls back
to its default, and `vercel.json` takes over again.

---

## Headers

`dist/_headers` is a Cloudflare Pages file. Vercel ignores it completely, which is
why the same rules are repeated in `vercel.json`. If you change one, change both,
or the security headers will silently differ depending on where you deployed.

Both set `X-Robots-Tag: noindex`, so a hosted programme does not turn up in
search results. That matters more than it sounds once a real account list is in
the app.

---

## Putting a login in front of it

A Vercel URL is public to anyone who has it. Fine for the fictional demo, not
fine for a real client programme.

**Vercel Authentication** (Settings → Deployment Protection) restricts access to
members of your Vercel team. Free on Hobby for preview deployments, and on Pro
for production too.

**Password Protection** on a Pro plan gives you a single shared password for the
whole deployment, which is usually enough for a client engagement.

If neither works for you, Cloudflare Access is free up to 50 users and sends a
one-time PIN by email. See `DEPLOY-TO-CLOUDFLARE.md`.

---

## If you are deploying to Vercel rather than Cloudflare

`.github/workflows/deploy.yml` publishes to Cloudflare Pages. It now skips the
deploy step when `CLOUDFLARE_API_TOKEN` is not set, so it will not fail your
builds. What it still does on every push is useful: it builds the app, runs the
38 checks, and refuses to go green if real client data has crept into the
repository.

Delete the workflow if you want, but the data check is worth keeping.

---

## Checking it worked

Open the deployment and confirm:

- The left rail runs from **Start Here** to **Our Method**.
- **The account list** shows accounts spread across all three tiers.
- Set the **Reference value** weight to zero and the tier counts move.
- Press **P** and presenter notes appear along the bottom.

A page that loads with no styling means `index.html` ended up in a subfolder
rather than at the root of the output.
