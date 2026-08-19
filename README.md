# ZAMSTARS ABM OS

An account-based marketing programme, built as software instead of a slide deck.

Ten stages take you from a one page executive summary to an agreed measurement
model. Two more screens run the programme once it is live. Everything on every
screen is editable in front of the client, and the numbers recalculate while you
talk.

It is one HTML file. No server, no database, no build step at runtime, no
dependencies. Open it and it works, including on a laptop with no internet in a
meeting room.

**[Open the live app](https://zamstars-abm-os.pages.dev)** &nbsp;·&nbsp; built by
[ZAMSTARS](https://www.zamstars.com)

---

## Why this exists

Most agencies present account-based marketing as a deck. The client nods, the
deck goes in a drawer, and three months later nobody can say which accounts were
engaged or what any of it cost.

This turns the same thinking into something you work through together. The client
edits the account list in the room. Change a scoring weight and watch a famous
logo drop out of Tier 1. Switch a play off and watch its budget redistribute
across the plays still running. By the end of the meeting they have signed off
eight stages and there is a dashboard waiting on Monday.

The rule the whole tool is built around: **if the client has not edited it, they
have not agreed to it.**

---

## What is in it

### Ten stages to build the programme

| | Stage | What you decide |
|---|---|---|
| 0 | Start here | The why, the what, the how, and what success looks like |
| 1 | Their business | What they sell, how the money works, what evidence exists |
| 2 | Who to target | Segments, fit criteria, and the reasons to walk away |
| 3 | The account list | Named accounts, scored out of 100, sorted into three tiers |
| 4 | Who says yes | The six roles on a buying committee and what each one needs |
| 5 | Buying signals | Triggers worth watching, weighted, with response times |
| 6 | How they buy | The customer journey, editable, with a persona lens |
| 7 | What we say | Core message plus a version for each role |
| 8 | The plays | What to run, what it costs, and what has to exist first |
| 9 | The first ninety days | Seven phases, owners, outputs and dependencies |
| 10 | How we measure | Coverage, engagement, progression, commercial |

### Two screens to run it

**Dashboard** shows how good the list is, where each account sits, how the funnel
converts, which plays earn their money, and every metric against target.

**Log the work** is where the team records what happened. Two numbers per account
and one reading per play. Everything on the dashboard comes from here.

---

## The parts worth stealing

**A scoring model the client can argue with.** Seven weighted factors produce a
mark out of 100 that sets the tier, and the weights are editable. Drop reference
value to zero and a famous logo leaves Tier 1. Push warm door to 40 and Tier 1
collapses to the handful where somebody already knows somebody. That is the
moment ABM stops being a marketing idea and becomes a capital allocation
decision.

**A budget allocator that never loses money.** Enter one number. It splits across
tiers, then across the live plays by effort weight. Type a real cost over any play
and it becomes fixed, so the rest of that tier redistributes around it. Switch a
play off and its money returns to the pool rather than disappearing. The total
always reconciles to the rupee.

**Four layers of measurement, in order.** Coverage, then engagement, then
progression, then commercial. You cannot honestly report engagement on accounts
whose committee you never mapped, and you cannot claim revenue impact with
nothing underneath it.

**Six commercial roles instead of personas.** Job titles change between companies.
The person who holds the budget, the one who judges the design, the one who lives
with it daily, the one who controls the timeline, the one who signs the contract
and the one who sells it internally do not.

**A persona lens on the journey.** The same nine stages seen through different
eyes. Cells not yet written for a given person are inherited from the baseline in
grey italic, so you can see at a glance how much thinking has actually been done.

---

## Running it

You do not need any of this to use the app. Download `dist/index.html` and open
it. The rest is only if you want to change it.

```bash
git clone https://github.com/YOUR-USERNAME/zamstars-abm-os.git
cd zamstars-abm-os
npm install      # jsdom, for the tests only
npm run build    # src/ becomes dist/index.html
npm test         # builds, then runs 38 checks in a headless DOM
```

### How the source is arranged

```
src/01-styles.html        design tokens and every style rule
src/02-shell.html         the page shell, rail, top bar, stage header
src/03-framework.js       the method itself: stages, scoring, roles, plays, measurement
src/04-clients.js         the worked example programme
src/05-store.js           state, hydration, scoring, budget allocation, persistence
src/06-stages-early.js    stages 0 to 5
src/07-stages-late.js     stages 6 to 10
src/08-run-and-wiring.js  dashboard, logging, actions, event wiring
```

`build.js` concatenates them in order into one file and then checks the output.
That is the entire toolchain, and it is deliberate. In two years this will still
build.

**If you want to change the method rather than a client**, `03-framework.js` is
the file. The stages, the scoring factors, the six roles, the play library, the
asset kit and the measurement layers all live there.

---

## Your own data

The repository ships one worked example, **Meridian Grid**, which is invented.
Every company, person and number in it is fictional.

Real client programmes never enter this repository. Build one in the app, press
**Export**, and keep the JSON somewhere private. Press **Import** to load it back.
Anything in `data/*.json` is gitignored.

That is also how you share work with a colleague. State lives in the browser, so
the URL is the app and the JSON is the data. Nobody's account list ever sits on a
server.

---

## Deploying it

The app is static, so anything that serves files will host it. See
[docs/DEPLOY-TO-CLOUDFLARE.md](docs/DEPLOY-TO-CLOUDFLARE.md) for the full walkthrough,
including how to put an email login in front of it with Cloudflare Access.

The short version: push to `main` and the included GitHub Action publishes
`dist/` to Cloudflare Pages. Two repository secrets are needed once,
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

**Before you point a client at a public URL**, remember that a `.pages.dev`
address is readable by anyone who has it. If you are hosting a real programme
rather than the demo, put Cloudflare Access in front of it. It is free for up to
50 users and takes about five minutes.

---

## Notes and limitations

- **State lives in the browser.** Two people opening the same URL each get their
  own copy. That is deliberate, but it means Export and Import are how work moves
  between people. Shared editing would need a Worker and a KV store.
- **"Analyse business" calls an outside service.** It fetches page text through
  `r.jina.ai` to guess an industry pattern. When it fails, and it will offline,
  the app falls back to a manual picker and everything else carries on.
- **Client logos are hot-linked when a programme supplies them.** Each one hides
  itself if it cannot load, leaving the text.
- **Print works.** The rail and top bar drop away, so any stage prints as a clean
  document.

## Keyboard

`0` executive summary · `1` to `9` build stages · `D` dashboard · `M` method
· `←` `→` move between stages · `P` presenter notes · `Esc` close a dialog

Presenter notes are worth knowing about. Every stage carries a short note on what
to actually say and which question to ask the client.

---

## Licence

Source-available. You may read it, run it, and use it inside your own
organisation. You may not redistribute it or offer it as a service to third
parties. See [LICENSE](LICENSE).

If you would rather this were MIT, that is a one file change. Licences are easy
to loosen later and impossible to tighten.

---

Built by [ZAMSTARS](https://www.zamstars.com). Business first, creative enabled,
outcome focused.
