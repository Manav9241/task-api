# PROGRESS.md — Where we are

> Roadmap lives in **PLAN.md**. This file is the **current state**, in three parts:
> - **Status** — where we are right now. Read first, every session.
> - **Deferred concepts** — the **action list**: what's owed, each with a due rung/trigger.
>   **Terse** — detail is re-derivable. Consumed at rung start.
> - **Session log** — history/reference only; drives nothing. Never put an action item here
>   (CLAUDE.md rule 9).

## Status
✅ **Rungs 0–4 + Rung 5a done** — Atlas free (M0) cluster; DB user + IP allowlist; connection
string in a **git-ignored `.env`** (verified ignored); `mongoose` + `dotenv` installed;
`.env.example` committed. **No app code yet** — `index.js` still runs on the in-memory array.
DB name `taskdb` (created on first write in 5b). *Rung 5 is split 5a/5b/5c because databases
are new learning, not revision.*
⏸ **Rung 5b — connect the app + define the `Task` model — NOT STARTED (replanning).** Its
async-teaching sub-plan was cleared 2026-07-29 to be re-derived from scratch — nothing prior is
locked in. What 5b must *cover* lives in **PLAN.md** (Rung 5b) plus the **Deferred concepts**
below; that's the scope to replan against.

## Deferred concepts (owed later)
> **The action list.** Each item: what's owed + **when it's due**. Keep terse — full teaching
> detail belongs in its own section, and generic technical facts are re-derivable. Remove once
> paid. **Test:** if it requires someone to DO something later, it belongs here — not the log.

- **Databases are NEW, not revision** → whole of Rung 5. The *concept of a database* is
  first-contact for the user (they've only used one from outside via C#/EF/SSMS). Teach the
  DB layer a level lower than feels needed: one idea at a time, tiny examples on code they
  already have (the array), **no stacked jargon/analogies until the base lands** (BSON, ODM,
  SQL comparisons are refinements added after). Hands-on: **define the noun before the action**
  (what a cluster/IP-allowlist/DB-user *is* before doing it).
- **Shape enforcement — same topic, 3 depths.** CONCEPT (5a): Mongo is permissive; **Mongoose
  is the app-side enforcer** — this is *why Mongoose exists*. CODE (5b): the `Task` schema +
  `strict`/`required` *is* the shape. PAYOFF (5c): validation→400 + safe wholesale `req.body`.
  Don't let the 5a concept slip into 5b.
- **Re-anchor 5b concepts at their 5c point-of-use** → 5c. `strict` (5b) is what makes 5c's
  PUT-from-`req.body` safe; `required` (5b) is what 5c maps to a 400. Re-teach where used.
  Also **hold the line: 5c stays on per-route `try/catch`** — centralised middleware is Rung 6.
- **PUT semantics vs mass assignment** → 5c. Rung 4's PUT hardcodes `{id,title,completed}`, so
  it silently drops other fields — not a true replace. Pure `{...req.body, id}` is a
  mass-assignment hole *without* a schema; once the 5b schema exists it becomes the allowlist
  and taking the body wholesale is safe. Close the loop explicitly.
- **Re-scope Rung 6 before starting it** → Rung 6 start. Two of its three topics are DB-facing
  and heavier than billed: input validation = Mongoose validators; centralised errors = mapping
  `CastError`/`ValidationError` → status codes. Decide whether Rung 6 needs its own split (input:
  how deep 5a–5c had to go). Related: "Later/optional" pagination/filter/sort is really DB
  *querying* (sort/skip/limit/operators) — heavier than it reads.
- **500 + centralised error handling** → Rung 6. 5xx was deliberately left out at Rung 4 (an
  unhandled crash falls through to Express's default handler). Make 500 deliberate via error
  middleware; reinforce **bad user input = 4xx, never 5xx**.
- **Express 5 vs 4** → 5b (trigger fired). In v5 a rejected async handler is auto-forwarded to
  the error handler; in v4 it is **not** (the request hangs — hence `express-async-handler`).
  Teach both, because the user's tutorials will be v4.
- **Mongoose 9 vs older tutorials** → 5b. Installed `^9.8.1`; tutorials use 6/7/8 (callbacks
  removed in v7 — all promises now; `strictQuery` default flipped). Flag a difference only
  where it actually bites, not the whole changelog.
- **README `.env` setup step** → 5b (first rung the app *reads* `.env`). Add to "Getting
  started": copy `.env.example` → `.env`, fill in `MONGODB_URI`. (The `.env`/dotenv setup
  itself was done in 5a.)

---

## Session log
> **History/reference only — no action items** (those go in *Deferred concepts* above).
> Log **only what git/PLAN/code don't already capture** — decisions (+ why), shaky spots,
> process/pace notes. No restating what we did, no commit hashes (`git log` has those). If a
> rung had nothing notable, skip the entry — the status line above is enough. Newest on top.

### (template) YYYY-MM-DD — Rung N
- **Decisions:** _(what we chose and why — no action items)_
- **Process / context:**

---

### 2026-07-24 — Rung 5 (decisions taken before starting)
- **Decisions:** Rung 5 **split into three — 5a (understand + provision) / 5b (connect +
  model) / 5c (convert routes).** First split two ways (infra/conversion); re-split when the
  user said databases are *new learning*, not revision — that made "what a database is" +
  Mongoose + connect + convert too much for one rung, the same overload the first split was
  meant to prevent, one level down. The seam is **understand → connect → convert**, one mode
  per rung, so no rung mixes first-contact concepts with a code rewrite. Not reads-vs-writes:
  that ordering would end a sub-rung with `GET` on Mongo and `POST` on the dead array — a
  broken app at a PR boundary. App stays on the array through 5a and 5b; only 5c swaps it.
  **`.env` + `dotenv` pulled forward from Rung 6 into 5a** — every rung ends in a commit, so
  an inline Atlas string would put a live password into permanent git history.
- **Process / context:** a run of the same failure — handing the user decisions that were
  mine (topic list offered as a menu; Atlas signup left for them to schedule then queried as a
  pre-flight quiz; doc edits announced before written; a Rung-5-specific git instruction written
  into CLAUDE.md as if general). Fixes landed in rules 4/6/8. The user caught all of these —
  which is itself the signal the system is meant to spare them.
- **Replanning is its own trigger.** New information about the user's baseline (databases are
  new) is a signal to re-scope the rung's *size*, not only lower the *pitch* — missing that
  forced the mid-rung 5a→5a/5b re-split.
- **"Covered" must mean audited against the topic, not my own list.** I twice assured the plan
  "covered" the DB material having only checked items I'd already identified — missed data
  integrity across apps + migrations until the user asked. Fix: integrity/migration *concepts*
  added to 5a; migration *implementation* ruled out of scope (single-writer app).

### 2026-07-16 — Rung 4
- **Decisions:** PUT keeps the user's `{...existing, title, completed}` spread rather than a
  fresh object — both are allowlists, and the spread carries `id` for free. Strict-PUT
  semantics parked until a schema exists (see Deferred).
- **Process / context:** refresher depth was too shallow here — PUT/PATCH was taught as
  definitions ("replace vs partial") without covering how you build the object or the
  mass-assignment risk. Led to CLAUDE.md rule 5. Also: POST/PUT validation was inconsistent
  because code was given per-rung without checking it against existing routes.

### 2026-07-16 — Rung 3
- **Decisions:** `id` comes from a standalone `nextId` counter, not `tasks.length + 1` — the
  latter reuses ids after a DELETE (which Rung 4 adds) and collides. Moot at Rung 5 (Mongo
  generates ids).
- **Process / context:** `core.autocrlf` set to **false** for this repo — it was `true` (the
  Git-for-Windows default), which spammed an "LF will be replaced by CRLF" warning on every
  commit. This is machine-local git config, **not** in any tracked file: a fresh clone
  elsewhere will show the warnings again until it's set there too.

### 2026-07-16 — Rung 2
- **Decisions:** introduced **404 + `res.status()` early** (nominally a Rung 4 topic) — a
  `:id` route that returns nothing for a bad id is simply broken, so it was unavoidable here.
  (The follow-up work this creates for Rung 4 is tracked in *Deferred concepts*.)

### 2026-07-16 — Rung 1.5
- **Decisions:** SSH over PAT — tokens expire and are a live secret to store; SSH keys don't
  expire and nothing gets pasted after setup. Key generated **without a passphrase** —
  accepted tradeoff for a private learning repo (note: the key is machine-wide, so if it's
  ever reused for work repos, revisit this).

### 2026-07-16 — Rung 1
- **Decisions:** `commonjs` over ESM — most Node/Express tutorials, existing code, and
  interview questions use `require()`; ESM's quirks would distract during revision.
- **Process / context:** switched from pseudo-code sketches to reference-code style (user
  types it themselves) — sketches were slower/more frustrating for revision.

### 2026-07-16 — Rung 0
- **Decisions:** learning files tracked in git (not ignored); GitHub → Rung 1.5 (private repo).
- **Process:** don't rush ahead uninvited; trust "done"/"working" without over-verifying.
