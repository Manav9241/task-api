# PROGRESS.md — Where we are

> Roadmap lives in **PLAN.md**. This file is the **current state**, in three parts:
> - **Status** — where we are right now. Read first, every session.
> - **Action list** — what's owed, each with a due step or trigger.
>   **Terse** — detail is re-derivable. Consumed at step start.
> - **Session log** — history/reference only; drives nothing. Never put an action item here —
>   anything that needs doing goes in the list above.

## Status
✅ **Steps 0–4, 5a, 5b, 5c, 6a, 6b, 7a done.** Atlas M0 cluster;
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
**7a landed:** `GET /tasks` takes `?completed=`, `?title=`, `?sort=`. `filter` is built key-by-key (never
`find(req.query)`); `completed` compared as text (`=== "true"`/`"false"`, never `Boolean()`); `title` is
`{ $regex: escapeRegex(t), $options: "i" }` — contains, case-insensitive, **user text escaped to literal**;
`sort` validated against a module-level `SORTABLE_FIELDS` allowlist with `-` stripped, defaulting to
`-createdAt`. `typeof x === "string"` guards on `title`/`sort` are load-bearing — they stop a **non-string**
reaching `.sort()`/`$regex` and 500ing. **Corrected 2026-08-25:** the case that actually occurs is a
**repeated key** (`?sort=a&sort=b` → `["a","b"]` → `.startsWith` throws `TypeError` → 500). It is *not*
an operator object: this app runs Express 5 with the default `query parser: "simple"`, under which
`?sort[$ne]=x` parses to the literal key `"sort[$ne]"`, leaving `req.query.sort` `undefined`. Verified
live. Outcome was always right; the recorded reason was wrong. Invalid values are **ignored, not 4xx**.
Verified live: 21 cases incl. injection attempts, all correct.
**7b landed:** `GET /tasks` takes `?page=`/`?limit=`. One helper `toPositiveInt(value, fallback)` guards
both — rejects non-strings first (a **repeated key** arrives as an array), converts with `Number` not
`parseInt` (`parseInt("10abc")` is `10` and `parseInt("1e3")` is `1` — it accepts junk silently), then
`!Number.isInteger(n) || n < 1` rejects `NaN`, floats, zero and negatives in a single test. `limit` is
clamped by `Math.min(..., MAX_LIMIT)`; `page` is **deliberately uncapped** — past the end is an empty
list, not an error. `DEFAULT_LIMIT = 10`, `MAX_LIMIT = 100`. Rows and `countDocuments(filter)` — **the
same filter**, or the totals describe a different set — run under `Promise.all`. Sort is
`` `${sort} -_id` ``: the `_id` tiebreak is what stops pages overlapping, and it is not theoretical —
`completed` holds two distinct values across the whole collection. Response is an **envelope**
`{ data, page, limit, total, totalPages, hasNextPage }`, a deliberate breaking change from the bare
array. Invalid values **ignored, not 4xx** — consistent with 7a. Added `scripts/seed.js` + `npm run seed`
(scoped `deleteMany({ title: /^Seed task/ })`, so it never touches hand-made tasks). Verified live:
**30 cases, all passing**, including walking every page under heavy sort ties with no duplicates and
nothing missed.

🏁 **task-api is COMPLETE.** Step 7b was the last step; there is no Step 8. This file is now a **record,
not a live state file** — nothing is owed and nothing is in flight. Auth (JWT) was considered and
rejected (single-user toy is the wrong home); its substance lives in the workspace `FUTURE-LEARNING.md`,
as does GraphQL. What comes after task-api is decided separately and is not planned here.

**Verified against the live DB 2026-08-25** (not recalled): `.limit(0)` returns the **whole collection**
— zero means *no limit*, so the `n < 1` guard is what stops `?limit=` (empty → `Number("")` → `0`)
serving everything. `.skip(-1)` throws `MongoServerError: BSON field 'skip' value must be >= 0` —
unrecognised by the error handler, so `?page=0` would 500. **Correction:** `.skip(1.5)` does **not**
error — the driver accepts it. `Number.isInteger` is therefore about refusing to silently reinterpret
the request, *not* crash-avoidance. Also confirmed: Express 5 default `query parser: "simple"` means
`?x[$ne]=` yields the literal key `"x[$ne]"`, so the `typeof === "string"` guards defend against
**repeated keys** (arrays), not operator objects.

## Action list (owed later)
> Each item: what's owed + **when it's due**. Keep terse — full teaching
> detail belongs in its own section, and generic technical facts are re-derivable. Remove once
> paid. **Test:** if it requires someone to DO something later, it belongs here — not the log.

_Empty._ The two auth/`PLAN.md` items were paid on 2026-08-25 (see the log entry below); the three
before them — system bloat, the ritual's ordering bug, and portability — by the system restructure.

_(The pagination "it's real DB querying, not a light add-on" warning is not listed here — it's baked
into PLAN's Step 7 split, so it's roadmap, not a loose item.)_

---

## Session log
> **History/reference only — no action items** (those go in the *Action list* above).
> Log **only what git/PLAN/code don't already capture** — decisions (+ why), shaky spots,
> process/pace notes. No restating what we did, no commit hashes (`git log` has those). If a
> step had nothing notable, skip the entry — the status line above is enough. Newest on top.

### (template) YYYY-MM-DD — Step N
- **Decisions:** _(what we chose and why — no action items)_

---

### 2026-08-25 — Step 7b (final step)
- **Decisions:** **Invalid paging values are ignored and defaulted, not 4xx** — chosen for *consistency*,
  not forgiveness: `?completed=banana` and `?sort=nonsense` were already ignored, so 400-ing on `?page=`
  would make strictness depend on which param you got wrong. Recorded counter-argument: silent correction
  hides client bugs (an off-by-one sending `?page=0` looks like it works). Switch to rejecting for a
  public/versioned API — but then for *every* param, not just the newest. **`-_id` tiebreak appended
  regardless of sort direction** — determinism is the requirement, not matching direction; matching would
  add branching for no behavioural gain. **`page` deliberately uncapped** — past the end is an empty list,
  which is a correct answer, not an error. **Seeder in `scripts/`, not `utils/`** — `utils/` holds code
  the app *imports*; nothing imports a seeder, a human runs it and it exits. Same sort-by-what-it-is call
  that put `AppError` in `utils/` rather than `middleware/`. **`hasNextPage` over `hasNext`** — user's
  rename during typing, and the better name. **No indexes added** — concept only; choosing them means
  `explain()` against real query patterns, and guessing from the code would be cargo cult.
- **Process — the teaching order failed again, but was caught in one message instead of six.** Beat 2
  bundled `NaN`, `Number`/`parseInt` and array-valued params into a single beat *while using all three as
  if already known*. Two things failed to land in one beat, so it was re-derived into four smaller beats
  rather than reworded. Same root cause as 7a — a topic list treated as a lesson plan — but the structural
  signal was acted on immediately this time.
- **Three corrections from the user, and they are not the same kind.** *No cross-stack references* and
  *all concepts before any code* are *rule defects* — `teach` actively permits the first and is silent on
  the second — so both went to `SYSTEM-BACKLOG.md`. *Plainer, shorter language* is a rule that already
  exists and I simply didn't follow; deliberately **no** rule change, since rewording a rule that was
  ignored grows the file without improving it.
- **Verifying beat recall, twice.** Checking Express's actual query parsing found **this file's own 7a
  entry was wrong** — the `typeof === "string"` guards defend against repeated keys (arrays), not operator
  objects, because Express 5 defaults to `query parser: "simple"`. And checking the driver caught a claim
  *I* had taught minutes earlier: `.skip(1.5)` does not throw. Both are now recorded above as verified.
- **Closing the project consisted of:** confirming the action list was empty, moving the one thing that
  would have died with `PLAN.md` (auth) out to the workspace beforehand, flipping the status lines in
  `PROGRESS.md`/`README.md`, and nothing else. No archiving — the repo is the archive. Recorded here
  deliberately, so the *next* project close has a precedent to generalise from rather than a guess; the
  backlog item for a real close ritual stays open on purpose.

### 2026-08-25 — Auth moved out of PLAN (docs PR — not a step)
- **Why now rather than at close:** both items were due *before task-api closes*, and the close is Step
  7b's own boundary — the moment the project stops. Paying them there would mean editing the roadmap
  during the ritual that retires it. Done ahead as their own docs PR, so 7b's PR is pagination alone.
- **The failure worth remembering: content outlived its file.** Auth's real substance sat in a *project*
  roadmap that stops being read the day the project ends — the cross-project idea list didn't exist when
  that section was written, so the only available shelf was the wrong one. `PLAN.md` keeps a one-line
  "considered and rejected" record, because *that* is a roadmap fact; the topic itself is now in
  `FUTURE-LEARNING.md`. **Test for next time: would this still be worth reading after this project's last
  step? If yes, a project file is the wrong home for it.**

---

### 2026-08-20 — Vocabulary cleanup (system work, not a step)
- **"Rung" is gone — work items are **steps**, everywhere.** The metaphor collided with the escalation
  ladder, and the system had ended up with three words for one thing (rung · unit · step). The
  per-project "call them whatever you like" mechanism was deleted along with it: used once, by one
  project, and what it produced was the collision.
- **The same fix applied to every other overloaded word.** `tier` now means only a position on the
  escalation ladder — the three instruction files are named by where they sit (machine · workspace ·
  project). "Contract", "filing test", "substrate" and "layer" are gone in favour of plain descriptions.
  **`Deferred concepts` became `Action list`** — it was the fourth name for one list.
- **An audit of the five skills cut ~160 lines that read as rules and changed no behaviour:** reasoning
  duplicated from the files it described, boundaries restated from always-loaded rules, and trigger
  lists inside skill bodies, which cannot fire because a body only loads *after* the skill is invoked.
- **Nothing here changed what the system does.** The test applied throughout was: would deleting this
  change any outcome?

### 2026-08-19 — System restructure (this PR — system work, not a step)
- **All three action-list items cleared; why each counts as paid.** *Bloat:* the 283-line `CLAUDE.md` is
  gone from this repo — its rules were sorted into three always-loaded instruction files (machine · workspace ·
  project) plus five on-demand skills, so the standing context now carries rules and
  triggers rather than teaching prose. *Ritual ordering:* fixed **structurally, not reworded** — the
  close ritual now puts every check that can edit a tracked file **before** the commit, which is precisely
  what stranded 7a's README edit. *Portability:* rules and memory no longer live under this project, so
  the next project inherits them instead of needing an export at close.
- **This project no longer keeps a working-rules file.** `PLAN.md` and `README.md` were re-pointed; the
  collaboration agreement is not a project artifact any more.
- **Old rule numbers in the entries below were deliberately left alone.** They were true when written,
  and rewriting history to point at new homes would falsify the record. Only *live* guidance was
  re-pointed.

### 2026-08-12 — Step 7a
- **Decisions:** **`title` search added to the step** (it was scoped as `completed`-only) — a lone boolean
  is self-validating, so the allowlist/injection material never bites; free text is where the real decisions
  are. **Regex `contains`, not prefix-anchored `^`** — a search that only matches from the first character
  is useless at this size, and `$options: "i"` defeats a plain index even when anchored, so the
  index argument for `^` doesn't hold without a collation index either. **Invalid filter/sort values are
  ignored, not 4xx** — a filter is an optional refinement, and erroring on `?completed=banana` while
  shrugging at `?sort=nonsense` would be arbitrary. **Single-field sort only** — multi-field would mean
  splitting on spaces and validating each part, for no gain here. **No date-range filters** (`$gte`): the
  safe-operator rule is taught, but implementing it is date-parsing plumbing.
- **Gotcha worth keeping:** the `typeof x === "string"` guards are **security controls, not tidiness**.
  Without them `requestedSort.startsWith(...)` on an operator object throws a `TypeError` → unrecognised
  by the error handler → **500 from user input**. Mongoose also does *not* validate a `$regex` pattern —
  `?title=[` is forwarded verbatim and MongoDB rejects it, so escaping is what prevents that 500 too.
- **Process — the teaching order failed badly.** I taught `req.query` and its traps across four beats
  before ever stating what a `filter` object *is*, so every trap landed as disconnected trivia; the user
  was lost for ~6 exchanges while I patched wording instead of questioning the sequence. Root cause: I
  inherited my own PLAN bullet order as a lesson plan rather than re-deriving it. Fixed by replanning
  mid-step into its own docs PR, and encoding it in rules 4/6 (mechanism before traps; repeated confusion
  = structural signal; a topic list is scope, not sequence — including one I wrote).
- **Verification:** I ran the 21-case suite myself against the live DB (filters, sort, escaping, injection
  attempts), self-cleaning the test documents.
- **Miss:** README's endpoint row was updated *after* the PR merged, leaving an uncommitted edit stranded
  on `main`. Caused by the ritual's own ordering, not a one-off slip — tracked as an action-list item.

### 2026-08-08 — Step 7 planning (this PR)
- **Decisions:** **Pagination/filter/sort promoted to a real Step 7, split 7a (filter+sort) / 7b
  (pagination)** — it's DB querying with real traps, not a one-liner; the old action-list warning to that
  effect is now baked into PLAN. **REST-style, not GraphQL:** the user asked whether GraphQL fits —
  clarified it's an *API* query language (single endpoint, client-picks-fields, resolvers still calling
  Mongoose underneath), **not** a DB query tool; adopting it would swap the whole API paradigm, so it's
  parked in FUTURE-LEARNING as its own project, not this step. **Auth stays out of task-api** — a
  single-user task toy is the wrong home for multi-user auth; it seeds the **next project (Blog API)**.
  task-api is declared **complete after Step 7**.
- **Process:** bundled with the CLAUDE.md teaching-correction sharpenings into one docs PR (per the
  roadmap-changes-get-their-own-PR rule), rather than folding into a step.

### 2026-08-08 — Step 6a
- **Decisions:** **Explicit forwarding via an `asyncHandler` HOF (`.catch(next)`), not Express 5's
  auto-forward** — user's call, and the interview-relevant one: leaning on the framework silently
  catching rejections hides the `next(err)` mechanism an interviewer probes. The wrapper is the
  version-agnostic production pattern (it's what `express-async-handler` is). Deliberate errors use a
  tiny `AppError(statusCode, message)` class so 404s/PUT-400 flow through the *same* central handler as
  DB errors (`http-errors` named as the packaged equivalent). **Express 4-vs-5 async comparison dropped
  entirely** (removed from PLAN + the action list) — user considers it exam trivia; we teach one canonical way.
- **Process:** concept pass re-planned twice on user pushback — first over-compressed (cut interview
  substance, not just walls), then corrected the auto-forward-vs-explicit framing. Depth calibration:
  "don't go too deep" ≠ "drop what interviews ask."

---

### 2026-08-08 — Step 6b
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

### 2026-07-31 — Step 6 re-scope (planning PR)
- **Decisions:** **Split Step 6 → 6a (centralised error handling) + 6b (MVC/architecture).**
  The `CastError`/`ValidationError`/500 mapping the deferred note feared was *already written
  inline* at 5c, so 6a is about DRYing the six repeated try/catch chains into one handler — not
  learning the mapping. "Validation beyond the schema" is genuinely thin for a two-field model, so
  it folds into 6a as a small beat rather than standing as its own part. 6b promoted from
  "mechanical refactor" to a **first-contact architecture concept** at the user's request — MVC
  taught architecture-first (separation of concerns, the API-has-no-View wrinkle, the service-layer
  seam, vs layered/hexagonal), *then* the file split. Two parts not three: validation too thin to
  stand alone; the folder-split must follow the error refactor, not precede it (else split-then-rewrite).

### 2026-07-31 — Step 5c
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
  Step-6 fodder — a centralised layer should smooth over them.

### 2026-07-31 — Step 5b
- **Decisions:** **Connect-then-listen** ordering (`await connectDB()` before `app.listen`) —
  fail fast/loud rather than serve before the DB is reachable. Advanced-async concept pass
  (`for await...of`, `AbortController`) **descoped** to a future project — task-api has no anchor
  to make it concrete (FUTURE-LEARNING #6 corrected).
- **Process / context:** async taught from absolute zero over many small beats; the unlock was
  framing `await` as **suspend the *function*, free the *thread*** (function-vs-thread, not
  "blocking"). User steered toward **full depth but tighter prose** (deep in small beats, not
  walls) and leaner doc-writing. Revision notes `javascript-async.md` + `mongoose.md` written
  mid-step.
- **DNS `ECONNREFUSED` on Atlas SRV — not self-resolved.** A later Codex session root-caused it to
  a **Node-version DNS-detection bug** (SRV lookup broke on one Node build, works on Node LTS); the
  fix + exact versions are recorded in **README → Troubleshooting**. Code carries no
  `dns.setServers` hack.

### 2026-07-24 — Step 5 (decisions taken before starting)
- **Decisions:** Step 5 **split into three — 5a (understand + provision) / 5b (connect +
  model) / 5c (convert routes).** First split two ways (infra/conversion); re-split when the
  user said databases are *new learning*, not revision — that made "what a database is" +
  Mongoose + connect + convert too much for one step, the same overload the first split was
  meant to prevent, one level down. The seam is **understand → connect → convert**, one mode
  per step, so no step mixes first-contact concepts with a code rewrite. Not reads-vs-writes:
  that ordering would end a sub-step with `GET` on Mongo and `POST` on the dead array — a
  broken app at a PR boundary. App stays on the array through 5a and 5b; only 5c swaps it.
  **`.env` + `dotenv` pulled forward from Step 6 into 5a** — every step ends in a commit, so
  an inline Atlas string would put a live password into permanent git history.
- **Process / context:** a run of the same failure — handing the user decisions that were
  mine (topic list offered as a menu; Atlas signup left for them to schedule then queried as a
  pre-flight quiz; doc edits announced before written; a Step-5-specific git instruction written
  into CLAUDE.md as if general). Fixes landed in rules 4/6/8. The user caught all of these —
  which is itself the signal the system is meant to spare them.
- **Replanning is its own trigger.** New information about the user's baseline (databases are
  new) is a signal to re-scope the step's *size*, not only lower the *pitch* — missing that
  forced the mid-step 5a→5a/5b re-split.
- **"Covered" must mean audited against the topic, not my own list.** I twice assured the plan
  "covered" the DB material having only checked items I'd already identified — missed data
  integrity across apps + migrations until the user asked. Fix: integrity/migration *concepts*
  added to 5a; migration *implementation* ruled out of scope (single-writer app).

### 2026-07-16 — Step 4
- **Decisions:** PUT keeps the user's `{...existing, title, completed}` spread rather than a
  fresh object — both are allowlists, and the spread carries `id` for free. Strict-PUT
  semantics parked until a schema exists (see the action list).
- **Process / context:** refresher depth was too shallow here — PUT/PATCH was taught as
  definitions ("replace vs partial") without covering how you build the object or the
  mass-assignment risk. Led to CLAUDE.md rule 5. Also: POST/PUT validation was inconsistent
  because code was given per-step without checking it against existing routes.

### 2026-07-16 — Step 3
- **Decisions:** `id` comes from a standalone `nextId` counter, not `tasks.length + 1` — the
  latter reuses ids after a DELETE (which Step 4 adds) and collides. Moot at Step 5 (Mongo
  generates ids).
- **Process / context:** `core.autocrlf` set to **false** for this repo — it was `true` (the
  Git-for-Windows default), which spammed an "LF will be replaced by CRLF" warning on every
  commit. This is machine-local git config, **not** in any tracked file: a fresh clone
  elsewhere will show the warnings again until it's set there too.

### 2026-07-16 — Step 2
- **Decisions:** introduced **404 + `res.status()` early** (nominally a Step 4 topic) — a
  `:id` route that returns nothing for a bad id is simply broken, so it was unavoidable here.
  (The follow-up work this creates for Step 4 is tracked in the *Action list*.)

### 2026-07-16 — Step 1.5
- **Decisions:** SSH over PAT — tokens expire and are a live secret to store; SSH keys don't
  expire and nothing gets pasted after setup. Key generated **without a passphrase** —
  accepted tradeoff for a private learning repo (note: the key is machine-wide, so if it's
  ever reused for work repos, revisit this).

### 2026-07-16 — Step 1
- **Decisions:** `commonjs` over ESM — most Node/Express tutorials, existing code, and
  interview questions use `require()`; ESM's quirks would distract during revision.
- **Process / context:** switched from pseudo-code sketches to reference-code style (user
  types it themselves) — sketches were slower/more frustrating for revision.

### 2026-07-16 — Step 0
- **Decisions:** learning files tracked in git (not ignored); GitHub → Step 1.5 (private repo).
- **Process:** don't rush ahead uninvited; trust "done"/"working" without over-verifying.
