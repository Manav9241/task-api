# PROGRESS.md — Where we are

> Roadmap lives in **PLAN.md**. This file is the **current state**, in three parts:
> - **Status** — where we are right now. Read first, every session.
> - **Deferred concepts** — the **action list**: what's owed, each with a due rung/trigger.
>   **Terse** — detail is re-derivable. Consumed at rung start.
> - **Session log** — history/reference only; drives nothing. Never put an action item here
>   (CLAUDE.md rule 9).

## Status
✅ **Rungs 0–4, 5a, 5b, 5c done.** Atlas M0 cluster; connection string in a git-ignored `.env`;
`mongoose` + `dotenv` installed. **5c landed:** all six routes now run on **Mongoose**
(`find`/`findById`/`create`/`findByIdAndUpdate`/`findByIdAndDelete`) — the in-memory `tasks` array,
`nextId`, and 5b's throwaway `Task.find()` log are **deleted**. `id`→`_id` (ObjectId);
`CastError`→**400**, `ValidationError`→**400**, per-route `try/catch` with a generic 500 (`err`
logged server-side, not returned); write-routes **allowlist `req.body`** (destructure), never spread.
**App persists across restarts** (the 5c success bar). DB `taskdb` / collection `tasks`. Revision
notes so far: `javascript-async.md`, `mongoose.md`.
⏭ **Rung 6 split into 6a + 6b** (planning PR landed). **6a next — centralised error handling:**
one `(err, req, res, next)` handler replacing the six repeated try/catch ladders; Express 4-vs-5
async forwarding (owed from 5b); a thin validation beat. **6b — MVC/layered architecture** (taught
architecture-first) + the folder split. See PLAN for both.

## Deferred concepts (owed later)
> **The action list.** Each item: what's owed + **when it's due**. Keep terse — full teaching
> detail belongs in its own section, and generic technical facts are re-derivable. Remove once
> paid. **Test:** if it requires someone to DO something later, it belongs here — not the log.

- **500 + centralised error handling** → Rung 6a. 5xx was deliberately left out at Rung 4 (an
  unhandled crash falls through to Express's default handler). Make 500 deliberate via error
  middleware; reinforce **bad user input = 4xx, never 5xx**. Cover **Express 4-vs-5 async
  forwarding** here too (owed from 5b — the app currently hand-catches in every route).
- **Pagination/filter/sort is DB *querying*, not a light add-on** → if/when tackled (Later/optional).
  It's `sort`/`skip`/`limit` + query operators — heavier than the one-liner it reads as.

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

### 2026-07-31 — Rung 6 re-scope (planning PR)
- **Decisions:** **Split Rung 6 → 6a (centralised error handling) + 6b (MVC/architecture).**
  The `CastError`/`ValidationError`/500 mapping the deferred note feared was *already written
  inline* at 5c, so 6a is about DRYing the six repeated try/catch ladders into one handler — not
  learning the mapping. "Validation beyond the schema" is genuinely thin for a two-field model, so
  it folds into 6a as a small beat rather than standing as its own part. 6b promoted from
  "mechanical refactor" to a **first-contact architecture concept** at the user's request — MVC
  taught architecture-first (separation of concerns, the API-has-no-View wrinkle, the service-layer
  seam, vs layered/hexagonal), *then* the file split. Two parts not three: validation too thin to
  stand alone; the folder-split must follow the error refactor, not precede it (else split-then-rewrite).

### 2026-07-31 — Rung 5c
- **Decisions:** **Allowlist `req.body` by destructuring named fields on every write-route; never
  spread it wholesale** — even though our 2-field schema + `strict` would make wholesale safe
  *today*. User's call, and the right one: this is interview revision, so the correct-by-default
  pattern is the deliverable; "the toy doesn't need it" trains the wrong reflex. `strict` stays as
  the floor (drops unknown fields); the route allowlist encodes *intent* (which fields a client may
  set), which `strict` structurally can't. Encoded as a standing principle in CLAUDE.md rule 2.
  PATCH allowlists *and* stays partial (only client-provided keys), so it doesn't clobber omitted
  fields to `undefined`.
- **Gotcha — `required` can't fire on a *missing* field during an update.** `findByIdAndUpdate`
  strips `undefined` from the update, so `runValidators` only checks fields *present* — great for
  PATCH (partial), but it means an empty-body PUT skips `required` and would 200 instead of 400.
  PUT therefore keeps **one explicit `if (title === undefined) → 400` guard** (the lone hand-written
  guard that survives, PUT-only; POST is covered by `create` running full validation, PATCH by
  partial semantics). Separately, an empty body makes `req.body` `undefined`, so destructuring it
  threw a `TypeError`→500 until we defaulted `req.body ?? {}` on all three write-routes. Both are
  Rung-6 fodder — a centralised layer should smooth over them.

### 2026-07-31 — Rung 5b
- **Decisions:** **Connect-then-listen** ordering (`await connectDB()` before `app.listen`) —
  fail fast/loud rather than serve before the DB is reachable. Advanced-async concept pass
  (`for await...of`, `AbortController`) **descoped** to a future project — task-api has no anchor
  to make it concrete (FUTURE-LEARNING #6 corrected).
- **Process / context:** async taught from absolute zero over many small beats; the unlock was
  framing `await` as **suspend the *function*, free the *thread*** (function-vs-thread, not
  "blocking"). User steered toward **full depth but tighter prose** (deep in small beats, not
  walls) and leaner doc-writing. Revision notes `javascript-async.md` + `mongoose.md` written
  mid-rung.
- **DNS `ECONNREFUSED` on Atlas SRV — not self-resolved.** A later Codex session root-caused it to
  a **Node-version DNS-detection bug** (SRV lookup broke on one Node build, works on Node LTS); the
  fix + exact versions are recorded in **README → Troubleshooting**. Code carries no
  `dns.setServers` hack.

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
