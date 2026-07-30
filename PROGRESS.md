# PROGRESS.md — Where we are

> Roadmap lives in **PLAN.md**. This file is the **current state**, in three parts:
> - **Status** — where we are right now. Read first, every session.
> - **Deferred concepts** — the **action list**: what's owed, each with a due rung/trigger.
>   **Terse** — detail is re-derivable. Consumed at rung start.
> - **Session log** — history/reference only; drives nothing. Never put an action item here
>   (CLAUDE.md rule 9).

## Status
✅ **Rungs 0–4, 5a, 5b done.** Atlas M0 cluster; connection string in a git-ignored `.env`;
`mongoose` + `dotenv` installed. **5b landed:** the app now **connects to MongoDB on boot**
(`mongoose.connect`, connect-then-listen, `process.exit(1)` on failure), the **`Task` schema +
model** are defined, and a **throwaway `Task.find()`** logs documents seeded by hand in Atlas.
**Routes still run on the in-memory array — only 5c swaps them.** DB `taskdb` / collection `tasks`
(auto-created by Mongoose). Revision notes this rung: `javascript-async.md`, `mongoose.md`.
⏭ **Rung 5c next — swap the storage.** Convert the six routes off the array onto Mongoose
(`find`/`findById`/`create`/`findByIdAndUpdate`/`findByIdAndDelete`); `id`→`_id`; `CastError`→400;
schema validation→400; delete `tasks`/`nextId` and the throwaway `Task.find()` log. See PLAN.md 5c.

## Deferred concepts (owed later)
> **The action list.** Each item: what's owed + **when it's due**. Keep terse — full teaching
> detail belongs in its own section, and generic technical facts are re-derivable. Remove once
> paid. **Test:** if it requires someone to DO something later, it belongs here — not the log.

- **Databases are NEW, not revision** → whole of Rung 5 (5c remains). The *concept of a database*
  is first-contact for the user (they've only used one from outside via C#/EF/SSMS). Teach the
  DB layer a level lower than feels needed: one idea at a time, tiny examples on code they
  already have (the array), **no stacked jargon/analogies until the base lands**. Hands-on:
  **define the noun before the action**.
- **Shape-enforcement payoff + PUT mass-assignment** → 5c. 5a taught the concept, 5b the code
  (`Task` schema + `strict`/`required`). At 5c, re-anchor **at point of use**: `required`→**400**
  (replacing the hand-written `if (!req.body.title)` guards); `strict` makes taking `req.body`
  **wholesale** safe — it's now an allowlist — closing **Rung 4's PUT mass-assignment hole** (Rung 4
  hardcodes `{id,title,completed}`, silently dropping other fields — not a true replace).
  **Hold the line: 5c stays on per-route `try/catch`** — centralised middleware is Rung 6.
- **Re-scope Rung 6 before starting it** → Rung 6 start. Two of its three topics are DB-facing
  and heavier than billed: input validation = Mongoose validators; centralised errors = mapping
  `CastError`/`ValidationError` → status codes. Decide whether Rung 6 needs its own split. Related:
  "Later/optional" pagination/filter/sort is really DB *querying* (sort/skip/limit/operators) —
  heavier than it reads.
- **500 + centralised error handling** → Rung 6. 5xx was deliberately left out at Rung 4 (an
  unhandled crash falls through to Express's default handler). Make 500 deliberate via error
  middleware; reinforce **bad user input = 4xx, never 5xx**.

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
- **DNS issue self-resolved.** The prior-session `mongodb+srv://` `ECONNREFUSED` (dead local DNS
  proxy) is gone — the app connects with the SRV string, no `dns.setServers` hack in the code.
  Nothing was owed to strip.

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
