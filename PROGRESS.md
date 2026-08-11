# PROGRESS.md — Where we are

> Roadmap lives in **PLAN.md**. This file is the **current state**, in three parts:
> - **Status** — where we are right now. Read first, every session.
> - **Deferred concepts** — the **action list**: what's owed, each with a due rung/trigger.
>   **Terse** — detail is re-derivable. Consumed at rung start.
> - **Session log** — history/reference only; drives nothing. Never put an action item here
>   (CLAUDE.md rule 9).

## Status
✅ **Rungs 0–4, 5a, 5b, 5c, 6a, 6b done — the full planned ladder is complete.** Atlas M0 cluster;
connection string in a git-ignored `.env`; `mongoose` + `dotenv` installed. All six routes run on
**Mongoose** (`find`/`findById`/`create`/`findByIdAndUpdate`/`findByIdAndDelete`); `id`→`_id`
(ObjectId); write-routes **allowlist `req.body`** (destructure), never spread; `title` has
`maxlength: 200`. **App persists across restarts.** DB `taskdb` / collection `tasks`. **Error handling
(6a):** every route wrapped in an `asyncHandler(fn)` HOF (`.catch(next)`, explicit forwarding);
deliberate errors `throw new AppError(statusCode, msg)`; **one** `(err, req, res, next)` handler maps
`err.statusCode` → `CastError`/`ValidationError`→400 → generic 500 (`err` logged, never returned).
**6b landed:** single-file `index.js` split into **layers** — `models/task.js`, `controllers/taskController.js`
(6 named handlers), `routes/taskRoutes.js` (`express.Router()` + `router.route()` chaining, mounted at
`/tasks`), `middleware/asyncHandler.js` + `middleware/errorHandler.js`, `utils/AppError.js`; `index.js`
is now thin composition (config → `express.json()` → mount router → error handler last → connect+listen).
No service layer (2-field CRUD doesn't warrant one). **Behaviour byte-identical to 6a** — verified across
all 13 GET/POST/PUT/PATCH/DELETE cases against the live DB. Revision notes: `javascript-async.md`, `mongoose.md`.
⏭ **Rung 7 next — query the collection** (`GET /tasks`): **7a** filtering + sorting, then **7b**
pagination, REST-style (query params → Mongoose). Real DB querying with real traps (unbounded result
sets, query-param/NoSQL injection, offset-pagination pitfalls) — split 7a/7b, see PLAN. **task-api
completes after Rung 7.** Auth (JWT) stays **out of scope** — the wrong fit for a single-user toy — and
the "Blog API next project" idea is **dropped**; what follows task-api is decided separately, not
planned here. GraphQL parked in `FUTURE-LEARNING.md` (a separate API paradigm, not this rung).

## Deferred concepts (owed later)
> **The action list.** Each item: what's owed + **when it's due**. Keep terse — full teaching
> detail belongs in its own section, and generic technical facts are re-derivable. Remove once
> paid. **Test:** if it requires someone to DO something later, it belongs here — not the log.

- **Restructure the system files to deal with bloat.** **Due: after Rung 7a closes**, as its own docs
  branch → PR (not folded into a rung). CLAUDE.md accretes because every recurring miss adds a
  sharpening clause and nothing triggers pruning. Worst overlap: the **depth/brevity axis is stated in
  five places** across rule 5 + Calibration (~45 lines, one idea, split over two sections) — consolidate
  to one section. Consider structural fixes beyond editing: splitting teaching-style rules out of
  CLAUDE.md into their own file, or moving them into a **skill / dedicated agent** loaded on demand, so
  the always-on context stays lean (the `revision-notes/index.md` and FUTURE-LEARNING pattern — details
  live in the file that needs them — applied to the rules themselves). **Restructure *toward* the
  portable shape below** — i.e. split generic-teaching-system from task-api-specific as part of this
  pass — so the export at project close is a move, not a second rewrite.

- **Make the system portable to future projects.** **Due: at task-api close (after Rung 7b),** before
  whatever project comes next. Today the whole system is bound to this project: `CLAUDE.md` lives in
  `task-api/`, and the memories live in a **per-project path**
  (`~/.claude/projects/E--Prepare-Interviews-05-.../memory/`) that will not auto-load for a different
  project. The rules are also a mix of **generic** (how to teach, rung/branch/PR rituals, depth
  calibration) and **task-api-specific** (this ladder, this stack) — the generic part is what must
  travel. Work needed: separate the two; collect the durable preferences currently spread across
  `CLAUDE.md` + `memory/*` into one exportable set; then pick a delivery mechanism — global
  `~/.claude/CLAUDE.md`, a **skill**, a **dedicated agent**, or a plugin — and verify it actually loads
  in a fresh project before relying on it.

_(The pagination "it's real DB querying, not a light add-on" warning is not listed here — it's baked
into PLAN's Rung 7 split, so it's roadmap, not a loose item.)_

---

## Lesson plan — Rung 7a (delete when the rung closes)
> Re-derived after a failed first attempt that taught `req.query` and its traps *before* ever saying what
> a filter object is. Shape: **mechanism (1–3) → input (4–5) → safety (6–7) → assembly (8).**
> Filters: `completed` **and `title`** (see PLAN — a lone boolean is self-validating, so the safety steps
> only bite once free text is in play). No date ranges.

1. **The destination.** The skeleton `const filter = {}` / `let sort = "-createdAt"` / `Task.find(filter).sort(sort)`
   — the rung is entirely about building those two values from the URL. Anchor first, no traps.
2. **`find(filter)` semantics.** Equality matching; `{}` = everything; multiple keys = AND; why `title`
   *can't* use equality; the operator *shape* (`{ field: { $op: … } }`) introduced here so 6–7 aren't cold.
3. **`.sort()` semantics.** `"-createdAt"` vs `{ createdAt: -1 }`; multiple fields; why a default order is
   needed at all (unsorted = arbitrary order, not insertion order).
4. **`req.query`.** URL → object; always `{}` not `undefined`; query params vs route params.
5. **Query value → usable value.** All strings ⇒ compare to text, never `Boolean()`/`!!`/ternary; build the
   filter conditionally (no key without a real value; stray `undefined` in a filter).
6. **Allowlists + operator injection.** `find(req.query)` and raw `sort` are holes; `?completed[$ne]=x`
   arrives as an object; allowlist keys *and* values, allowlist sortable fields. Same reflex as the
   `req.body` destructuring already in the write-routes.
7. **Regex injection (`title`).** User text compiled into a regex: escape metacharacters, `$options: "i"`,
   prefix `^` (index-usable) vs substring (full scan), ReDoS from a crafted pattern.
8. **Assembly.** Chaining + laziness (a `Query` is built, DB hit on `await`); controller-inline vs helper;
   then write and test it.

---

## Session log
> **History/reference only — no action items** (those go in *Deferred concepts* above).
> Log **only what git/PLAN/code don't already capture** — decisions (+ why), shaky spots,
> process/pace notes. No restating what we did, no commit hashes (`git log` has those). If a
> rung had nothing notable, skip the entry — the status line above is enough. Newest on top.

### (template) YYYY-MM-DD — Rung N
- **Decisions:** _(what we chose and why — no action items)_

---

### 2026-08-08 — Rung 7 planning (this PR)
- **Decisions:** **Pagination/filter/sort promoted to a real Rung 7, split 7a (filter+sort) / 7b
  (pagination)** — it's DB querying with real traps, not a one-liner; the old *Deferred* warning to that
  effect is now baked into PLAN. **REST-style, not GraphQL:** the user asked whether GraphQL fits —
  clarified it's an *API* query language (single endpoint, client-picks-fields, resolvers still calling
  Mongoose underneath), **not** a DB query tool; adopting it would swap the whole API paradigm, so it's
  parked in FUTURE-LEARNING as its own project, not this rung. **Auth stays out of task-api** — a
  single-user task toy is the wrong home for multi-user auth; it seeds the **next project (Blog API)**.
  task-api is declared **complete after Rung 7**.
- **Process:** bundled with the CLAUDE.md teaching-correction sharpenings into one docs PR (per the
  roadmap-changes-get-their-own-PR rule), rather than folding into a rung.

### 2026-08-08 — Rung 6a
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

---

### 2026-08-08 — Rung 6b
- **Decisions:** **`router.route()` chaining** over flat `router.get/post` — both our paths are
  multi-method, so grouping by path (write the path once) is the cleaner, idiomatic fit; I'd defaulted
  to the flat form and the user caught the better option. **`AppError` lives in `utils/`, not
  `middleware/`** — it's a plain error *type* controllers throw, not a function Express runs in the
  pipeline. **No service layer** — a 2-field CRUD app has no logic beyond call-model-and-respond;
  adding one would be an empty hop (cargo-culting the anti-pattern). Taught fat-model/skinny-controller
  as the reason it's fine here (rules already live on the schema).
- **Process:** hexagonal architecture taught properly on request (real order-service example + a Java
  code sketch showing ports/adapters + DI), not hand-waved as "overkill." Two typing-stage bugs caught
  in review — hardcoded `completed: false` in POST, and a missing `await` on PUT's `findByIdAndUpdate`.
  I ran the 13-case suite myself this time (server + HTTP), self-cleaning the test docs.

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
