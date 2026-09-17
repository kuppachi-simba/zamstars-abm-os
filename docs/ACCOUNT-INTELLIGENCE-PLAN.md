# Account Intelligence: audit and implementation plan

Response to the Account Intelligence product requirements, version 1.0.

Read this before the code. It says what the existing application is, which
parts of the brief fit it, which parts cannot exist in it, and what is being
built as a result.

---

## 1. Current state audit

### What the application actually is

| Property | Reality |
|---|---|
| Architecture | One static HTML file, 4,242 lines of source concatenated by `build.js` |
| Server | None |
| Database | None. State is a single JSON object in `localStorage` |
| Authentication | None. No user identity exists |
| Users | One browser, one copy. Sharing happens by JSON export and import |
| Network calls | One, optional: `r.jina.ai` to guess an industry from a URL |
| Dependencies | None at runtime. `jsdom` for tests only |
| Build | Concatenation. No bundler, no transpiler, no framework |

### The conventions the module must follow

- **Rendering.** A `VIEWS` map takes a stage id to a function returning an HTML
  string. `render()` writes it into `#stagebody`.
- **Editing.** `data-set="dot.path.to.field"` binds an input to the client
  object. `data-live="1"` re-renders after commit.
- **Typing never re-renders.** `input` writes through and saves. `change` is the
  only commit point. This was a bug fix and it must not be undone.
- **Actions.** `data-act="name"` dispatches to `ACT.name(el)`.
- **Migration.** `normalise(c)` runs on every load and back-fills missing fields.
  This is how old saved programmes survive new code.
- **Colour semantics.** Cream `#FFFCF4` means you fill this in. Pale green
  `#F4FAF8` means we work this out.
- **Build guards.** No em dashes. No external script tags. Both fail the build.

### What already exists that the brief re-specifies

| Brief section | Already in the app |
|---|---|
| 5.11 Buying committee | Six commercial roles, per-account role coverage |
| 7 Stage 6 scoring | Seven weighted factors, editable, producing 0 to 100 |
| 4 Tier model | Score bands set tier: Tier 1 at 74, Tier 2 at 52 |
| 10 Play builder | 28 play templates with budget allocation |
| 16 Measurement | Four layers: coverage, engagement, progression, commercial |
| 12.1 Dashboard | Funnel, play returns, metrics against target |

None of this is being rebuilt.

---

## 2. What cannot be built, and why

These are not scoping choices. They are architecturally impossible in a static
file with no server.

| Brief section | Requirement | Why it cannot exist |
|---|---|---|
| 6, 7.3 | Automated research collection from public sources | Needs API keys. A key in a public static file is a published key |
| 7.4, 14.1 | AI extraction and synthesis | Same. There is no server to hold a model credential |
| 14.4 | Scheduled refresh by tier | Nothing runs when the tab is closed |
| 17 | Roles and permissions | No authentication, so no user to grant a role to |
| 13, 17 | Audit log, `approved_by` | A typed name is a label, not proof of identity |
| 18 | CRM, email, calendar, LinkedIn sync | No server to hold OAuth tokens or run a sync |
| 19 | Notifications | No background process and no delivery channel |
| 11 | Recommendations from live signals | Rules can run on entered data, not on data nobody fetched |

**Roughly 40% of the brief depends on a backend.** The decision taken is to
build the 60% that does not, and to shape the data model so a backend can be
added behind it later without rewriting the front end.

---

## 3. What is being built

### Phase 1: research foundation

1. **Account Intelligence workspace**, reached from the left rail, with an
   account picker and tabbed sub-navigation.
2. **Sites as child records.** One account holds many properties, each with its
   own status, need and opportunity state. This is the change that makes the
   module work for iBUS, because the opportunity is a building, not a company.
3. **Fourteen research areas** from section 5, each marked complete, partial,
   missing, needs verification, stale or not applicable.
4. **Findings with evidence.** Every finding carries a type of fact, inference
   or hypothesis, a confidence, a verification status and a source reference.
   A finding without a source is visibly marked as such.
5. **Source library** per account, with publisher, URL, publication date, date
   accessed and a source-quality rating on the five-point hierarchy.
6. **Buying committee** with the ten roles from the brief, influence, authority,
   relationship strength, owner and last verified date. Role gaps are shown
   against the tier target.
7. **Triggers** with date, strength, source, relevance window and action window.
8. **Five transparent sub-scores**: fit, intent, timing, coverage, relationship.
   Each shows its inputs. None of them is combined into a hidden number.
9. **Tier override with a reason and history.** Score sets a suggested tier. A
   human can overrule it, but must say why, and the change is kept.
10. **Tier research checklists** from section 15, driving a coverage view.
11. **Account brief** generated from verified findings, exportable.

### Phase 2: strategy and orchestration

12. **Account strategy canvas**, fifteen fields, from section 8.
13. **Ten-stage account journey** from section 9, with gate conditions that must
    be met before a stage advances, and stage history.
14. **Next best action** as explained rules over entered data. Every
    recommendation shows the rule that fired and the evidence behind it.
15. **Journey timeline** combining findings, triggers, stage changes and touches.

### Deferred to Phase 3, when a backend exists

Play and touchpoint orchestration across contacts, coordination safeguards,
CRM opportunity sync, notifications, permissions.

---

## 4. Data model

All of this hangs off the existing account object inside the client JSON. No new
top-level entities, because there is no database to put them in.

```
account
  tierSet      manual tier, empty means use the score
  tierWhy      reason for the override
  tierHist     [{ from, to, why, at }]
  jstage       journey stage 0 to 9
  jhist        [{ from, to, evidence, at }]
  status       active, pause, nurture or disqualified
  statusWhy    reason
  research     { areaKey: { st, note } }
  sources      [{ id, type, publisher, title, url, pub, acc, note, q }]
  findings     [{ id, area, siteId, title, text, kind, conf, ver, srcId, at }]
  sites        [{ id, name, type, city, status, owner, size, date, need, opp, conf }]
  people       [{ id, name, title, fn, sen, role, infl, auth, rel, eng, owner, verAt, next }]
  trigs        [{ id, type, desc, date, expiry, strength, srcId, action, status }]
  strategy     { objective, thesis, whyNow, priority, value, champion, access,
                 proof, offer, obstacles, success, exit, questions[] }
```

**Every field is optional.** `normalise()` back-fills them, so a programme saved
before this module existed opens without error and simply shows empty research.
That is the migration, and it is reversible: deleting the new source files
returns the app to its previous behaviour with the data ignored rather than
lost.

### Why this shape survives a later backend

Each array is a flat list of records with a stable `id`. Each maps one to one
onto the table in section 13 of the brief. Moving to Postgres later means
writing the account id onto each row and changing the read path, not
redesigning the model.

---

## 5. Files

New, in `src/`, concatenated after the existing files:

```
09-intel-framework.js    research areas, roles, journey stages, checklists, rules
10-intel-store.js        model migration, sub-scores, coverage, brief generation
11-intel-workspace.js    the workspace and its tabs
12-intel-actions.js      actions, next best action engine, view registration
```

Changed:

```
src/03-framework.js      one new entry in STAGES
build.js                 four new files in the concatenation order
test/smoke.js            new checks
```

`VIEWS` and `ACT` are extended by assignment from `12-intel-actions.js` rather
than edited in place, so the existing dispatch code is untouched.

---

## 6. Assumptions and open questions

**Assumptions made**

1. The account is the unit of work and people belong to it. Contact-level
   activity rolls up without automatically moving the account stage.
2. Research is entered by a human. The module structures and challenges the
   thinking rather than performing the research.
3. Tier target coverage is 5 to 10 people for Tier 1, 3 to 6 for Tier 2, 1 to 3
   for Tier 3, per section 4.
4. The existing seven-factor score stays the master score. The five sub-scores
   are added alongside it rather than replacing it, because the existing score
   is demonstrated to clients and works.

**Open questions**

1. **Does the account brief need to be a Word document?** Currently it exports
   as printable HTML, matching how the rest of the app prints.
2. **Should journey stage gates block, or warn?** Built as warn, with the gate
   conditions shown. Blocking is a one-line change if you want it.
3. **How much demo data?** One fully researched fictional account is built. More
   is cheap but makes the file larger.
4. **Section 3.7 privacy.** Suppression status is recorded per person and
   respected in the UI. Genuine consent management needs the backend.

---

## 7. Definition of done

The module is finished when a user can select an account, see the research
checklist for its tier, capture structured findings with sources, mark them
fact, inference or hypothesis, verify or reject them, map the buying committee
and see role gaps, view five explained sub-scores, override the tier with a
reason, write a strategy canvas, move the account through the journey with
evidence, receive explained next best actions, and generate a brief, without
any existing feature changing behaviour.
