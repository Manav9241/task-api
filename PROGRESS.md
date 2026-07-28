# PROGRESS.md — Where we are

> The stable roadmap lives in **PLAN.md**. This file holds three things with **different jobs**:
> - **Status** — where we are right now. Read first, every session.
> - **Deferred concepts** — the **action list**. Everything owed later, each with a due rung
>   or trigger. This is the only part that reliably drives action; consume it at rung start.
> - **Session log** — *history/reference only*: why we decided things. **Not reliably read,
>   and nothing in it drives action.** Never put an action item here (see CLAUDE.md rule 9).

## Status
✅ Rungs 0–4 + **Rung 5a done** — MongoDB Atlas free (M0) cluster provisioned; DB user +
IP allowlist set; connection string stored in a **git-ignored `.env`** (verified ignored);
`mongoose` + `dotenv` installed; `.env.example` committed. **No app code yet** — `index.js`
still runs entirely on the in-memory array. DB name chosen: `taskdb` (springs into existence on
first write in 5b). *Rung 5 is split 5a/5b/5c because databases are new learning, not revision.*
▶ **Next: Rung 5b — Connect the app and define the model.** Mongoose (Schema/Model/Document,
field types, `strict`, `_id`), async + `try/catch` (+ Express 5 vs 4), `mongoose.connect()` on
boot, define the `Task` schema/model, seed 1–2 docs by hand in Atlas, read them back with
`Task.find()`. **Still no route swaps** — that's 5c. *First thing to confirm in 5b: the stored
credentials actually connect (5a never ran a live connection — that was deliberately deferred).*
⚠️ Deferred due 5b (see list): **Express 5 vs 4**, **Mongoose 9 vs older versions**, close the
**async "why"** + **shape-enforcement** loops opened in 5a; **databases-are-new** spans 5a–5c.

## Deferred concepts (owed later)
> **The action list.** Anything **promised or spotted for later** — concepts to teach, traps
> to demonstrate, things to watch for. Each item states **when it's due** (a rung, or a
> trigger). Keep visible here until paid, then remove.
> **The test:** if it requires someone to DO something later, it belongs here — not the log.

- **Databases are NEW, not revision — teach ground-up for the rest of Rung 5.** Not just
  MongoDB/Mongoose — **the concept of a database itself** is new for the user (they've only
  touched one from the outside via C#/EF/SSMS, never learned what it is). They have strong
  Node/Express/JS fluency, but treat the whole DB layer as first-contact. For every DB topic:
  start one level lower than feels necessary, build from zero, one idea at a time, concrete
  tiny examples anchored to code they already have (e.g. the in-memory array), **no stacked
  jargon or analogies until the base idea is solid** — SQL/EF comparisons and terms like BSON,
  native-validation, ODM are *refinements added after*, never the vehicle. Whole thread (5a–5c).
  **Hands-on steps too:** define the *noun* before asking for the action — what a **cluster**
  is before "create a cluster", what **IP allowlisting** is before setting it, what a **database
  user** is before creating one. Never send the user to do something whose name is new to them;
  the term comes first, then the click.
  **Carve-out:** the *async* block in 5b (callbacks/promises/`async/await`) is NOT new — the
  user is fluent in JS; teach it at refresher depth. "Ground-up" targets the **DB-specific**
  concepts only; don't slow-walk async under the same banner. **Watch 5b's load:** it's the
  densest slice (Mongoose concepts + async + connect + model) — if it drags, it can split at
  the concepts/code seam, same as we did for the rung overall.
- **Shape enforcement threads across 5a→5b→5c at three depths — do NOT let the 5a layer slip.**
  Same topic, deepening each rung: **CONCEPT (5a)** — MongoDB is permissive (no shape guarantee
  by default) and **Mongoose is the app-side enforcer**; this is *why Mongoose exists*, so it
  belongs in 5a's "what is Mongoose" explanation and must be taught there, **not deferred**.
  **CODE (5b)** — write the `Task` schema + `strict`/`required`; the schema *is* the shape.
  **PAYOFF (5c)** — validation→400 and safe wholesale `req.body` (see the PUT and re-anchor
  items below). Caught 2026-07-24: I hand-waved the 5a concept ("deal with it when it matters")
  and mis-filed it into 5b — that collapse is exactly what would make the 3-way split pointless.
- **Close the async "why" in 5b — it was opened in 5a** → due **Rung 5b**. During 5a's
  "database is a separate program" concept, async was motivated up front: talking to a separate
  program over a network isn't instant, so the app must *wait for an answer*, and **that** is
  where `async/await` comes from — not a MongoDB quirk. When teaching async in 5b, open from
  that origin (separate program → non-instant → await), don't teach it cold as syntax.
- **Re-anchor the 5b concepts at their 5c point-of-use** → due **Rung 5c**. The split puts two
  concepts a rung away from the code that needs them: **`strict` mode** (taught 5b) is what
  makes 5c's PUT-from-`req.body` safe, and **`required` in the schema** (written 5b) is what
  5c maps to a 400. Re-teach both where they're used — don't assume they carried across.
  Also hold the line: **5c stays on per-route `try/catch`**; centralised error middleware is
  Rung 6, and 5c must not drift into it.
- **PUT semantics vs mass assignment** → due **Rung 5c**. Rung 4's PUT hardcodes an
  allowlist (`{id, title, completed}`), so it **silently ignores any other field the client
  sends** — not true "replace the resource". The pure version is `{...req.body, id: taskId}`,
  but that's a **mass assignment** hole without a schema (client could inject `isAdmin` etc.).
  Once the **Mongoose schema** exists (written in 5b), revisit: it becomes the allowlist and
  strips unknown fields, so taking the body wholesale becomes safe. Close the loop explicitly.
- **Re-scope Rung 6 once Rung 5 lands** → due **at Rung 6 start (revisit trigger)**. Under
  "databases are new, not revision", two of Rung 6's three topics are DB-facing and heavier
  than their one-line billing: **input validation** = Mongoose validators/custom validators,
  and **centralised error handling** = mapping Mongoose error types (`CastError`,
  `ValidationError`) to status codes. Bundled with the folder refactor, that's the same
  over-bundling we split Rung 5 to avoid. Before starting Rung 6, decide whether it needs the
  same split. How deep 5a–5c had to go is the input to that call — don't redesign 6 early.
  (Related: the "Later/optional" pagination/filter/sort line is really DB *querying* —
  sort/skip/limit/operators — heavier than it reads for a newcomer, if we ever pick it up.)
- **500 + centralised error handling** → due **Rung 6**. Status codes were formalised at
  Rung 4 (200/201/204/400/404) but **5xx was deliberately left out** — right now an unhandled
  crash falls through to Express's default handler. Rung 6 must make 500 deliberate via
  error-handling middleware, and reinforce: **bad user input is always 4xx, never 5xx.**
- **Express 5 vs Express 4 differences** → **TRIGGER FIRED — due Rung 5b** (with the async
  `try/catch` teaching). Promised at Rung 1 to flag it if a real difference ever bit. It bites
  here: in **Express 5 an async handler that rejects is forwarded to the error handler
  automatically**; in **Express 4 it is not** (an unhandled rejection just hangs the request —
  hence `express-async-handler` and wrapper helpers all over v4 tutorials). Teach both, because
  tutorials the user follows will be v4.
- **Mongoose 9 vs older tutorial versions** → due **Rung 5b (on trigger, like Express 5v4)**.
  Installed Mongoose `^9.8.1`; most tutorials/StackOverflow use 6/7/8, which had real API
  changes across majors (e.g. callback support removed in v7 — everything is promises now;
  `strictQuery` default flips). When writing schema/connect/query code in 5b, flag any place a
  v9 behaviour differs from what a follows-along tutorial would show. Don't pre-teach the whole
  changelog — surface a difference only where it actually bites, same discipline as Express 5v4.
- **README setup step for `.env`** → due **Rung 5b** (the milestone where the app first *reads*
  `.env`). From 5b, `npm install` + `npm run dev` alone won't start the app — it needs a `.env`
  with a real `MONGODB_URI`. Update README "Getting started": copy `.env.example` → `.env`, fill
  in an Atlas connection string. *(The Atlas-credential/`.env` setup itself was paid in 5a:
  `.env` created + verified git-ignored, `.env.example` committed, `dotenv` installed.)*

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
  mine. The topic list was offered as a *menu to pick from* (they can't know which topics
  matter before learning them → rule 4 rewrite); the Atlas signup was left for them to
  schedule, then queried as a pre-flight "do you already have an account?" about a service
  they hadn't met yet (→ rule 6's sequencing clause). Also: doc edits were announced as done
  before being written (→ rule 8), and a Rung-5-specific git instruction was written into
  CLAUDE.md as if it were a general rule — **project specifics go in PLAN/PROGRESS; CLAUDE.md
  only describes how I behave.** The user caught all of these, which is itself the signal:
  the system is meant to spare them that.
- **Replanning as its own trigger.** When the user said databases were new, I lowered teaching
  altitude but left the plan intact and started teaching — missing that a scope-changing fact
  demands re-checking the rung's *size*, not just the *pitch*. That's what forced the 5a→5a/5b
  re-split mid-rung. Lesson: new information about the user's baseline is a signal to re-scope,
  not only to re-explain.
- **"Covered" must mean audited against the topic, not against my own list.** Twice I assured
  the user Rung 5's plan "covered" the confusing DB material; both times I'd checked only the
  items I'd already identified (shape-enforcement, connection-string, async depth) — never
  audited for *data integrity across apps* or *migrations*, which were absent. The user asked
  the direct questions (two apps + divergent schemas → inconsistency; schema change over time;
  what is migration) and exposed the gap. Lesson: when asserting coverage of a *domain*, audit
  against the domain's real surface, not against my own prior notes — otherwise "all covered"
  is just "all of what I happened to list." Fix landed: integrity/migration **concepts** added
  to 5a; migration **implementation** explicitly ruled out of scope (single-writer app).

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
