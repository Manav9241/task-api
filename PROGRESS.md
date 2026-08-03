# PROGRESS.md — Where we are

> Roadmap lives in **PLAN.md**. This file is the **current state**, in three parts:
> - **Status** — where we are right now. Read first, every session.
> - **Deferred concepts** — the **action list**: what's owed, each with a due rung/trigger.
>   **Terse** — detail is re-derivable. Consumed at rung start.
> - **Session log** — history/reference only; drives nothing. Never put an action item here
>   (CLAUDE.md rule 9).

## Status
✅ **Rungs 0–4, 5a, 5b, 5c, 6a done.** Atlas M0 cluster; connection string in a git-ignored `.env`;
`mongoose` + `dotenv` installed. All six routes run on **Mongoose**
(`find`/`findById`/`create`/`findByIdAndUpdate`/`findByIdAndDelete`); `id`→`_id` (ObjectId);
write-routes **allowlist `req.body`** (destructure), never spread. **App persists across restarts.**
DB `taskdb` / collection `tasks`. **6a landed:** per-route `try/catch` ladders **gone** — every route
wrapped in a `asyncHandler(fn)` HOF (`.catch(next)`, explicit forwarding, not framework auto-forward)
and deliberate errors `throw new AppError(statusCode, msg)`; **one** `(err, req, res, next)` handler maps
`err.statusCode` → `CastError`/`ValidationError`→400 → generic 500 (`err` logged server-side, never
returned). `title` gained `maxlength: 200`. Status codes **identical to 5c** (the 6a success bar).
Revision notes so far: `javascript-async.md`, `mongoose.md`.
⏭ **6b next — MVC/layered architecture** (taught architecture-first: separation of concerns, the
API-has-no-View wrinkle, the service-layer seam, vs layered/hexagonal) + the folder split
(`routes/`, `controllers/`, `models/`, `middleware/` — the 6a error handler moves there). See PLAN.

## Deferred concepts (owed later)
> **The action list.** Each item: what's owed + **when it's due**. Keep terse — full teaching
> detail belongs in its own section, and generic technical facts are re-derivable. Remove once
> paid. **Test:** if it requires someone to DO something later, it belongs here — not the log.

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

---

### 2026-08-03 — Rung 6a
- **Decisions:** **Explicit forwarding via an `asyncHandler` HOF (`.catch(next)`), not Express 5's
  auto-forward** — user's call, and the interview-relevant one: leaning on the framework silently
  catching rejections hides the `next(err)` mechanism an interviewer probes. The wrapper is the
  version-agnostic production pattern (it's what `express-async-handler` is). Deliberate errors use a
  tiny `AppError(statusCode, message)` class so 404s/PUT-400 flow through the *same* central handler as
  DB errors (`http-errors` named as the packaged equivalent). **Express 4-vs-5 async comparison dropped
  entirely** (removed from PLAN + Deferred) — user considers it exam trivia; we teach one canonical way.
- **Process:** concept pass re-planned twice on user pushback — first over-compressed (cut interview
  substance, not just walls), then corrected the auto-forward-vs-explicit framing. Depth calibration:
  "don't go too deep" ≠ "drop what interviews ask."
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
