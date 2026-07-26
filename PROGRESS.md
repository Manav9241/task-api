# PROGRESS.md — Where we are

> The stable roadmap lives in **PLAN.md**. This file holds three things with **different jobs**:
> - **Status** — where we are right now. Read first, every session.
> - **Deferred concepts** — the **action list**. Everything owed later, each with a due rung
>   or trigger. This is the only part that reliably drives action; consume it at rung start.
> - **Session log** — *history/reference only*: why we decided things. **Not reliably read,
>   and nothing in it drives action.** Never put an action item here (see CLAUDE.md rule 9).

## Status
✅ Rung 4 done — full CRUD in memory (GET/POST/PUT/PATCH/DELETE), status codes formalised.
▶ **Next: Rung 5a — Connect the database.** Rung 5 was **split into 5a (infrastructure) and
5b (conversion)**; see PLAN.md for the full topic allocation. 5a = Atlas + Mongoose + schema
/model + `.env`, with **all six routes left on the in-memory array and working**. 5b = swap
all six to DB calls and delete the array.
⚠️ Four deferred items come due across this rung — **two in 5a, two in 5b**. Read the list
below rather than trusting this line; it is a pointer, not a copy.

## Deferred concepts (owed later)
> **The action list.** Anything **promised or spotted for later** — concepts to teach, traps
> to demonstrate, things to watch for. Each item states **when it's due** (a rung, or a
> trigger). Keep visible here until paid, then remove.
> **The test:** if it requires someone to DO something later, it belongs here — not the log.

- **Re-anchor the 5a concepts at their 5b point-of-use** → due **Rung 5b**. The split puts two
  concepts a rung away from the code that needs them: **`strict` mode** (taught 5a) is what
  makes 5b's PUT-from-`req.body` safe, and **`required` in the schema** (written 5a) is what
  5b maps to a 400. Re-teach both where they're used — don't assume they carried across.
  Also hold the line: **5b stays on per-route `try/catch`**; centralised error middleware is
  Rung 6, and 5b must not drift into it.
- **PUT semantics vs mass assignment** → due **Rung 5b**. Rung 4's PUT hardcodes an
  allowlist (`{id, title, completed}`), so it **silently ignores any other field the client
  sends** — not true "replace the resource". The pure version is `{...req.body, id: taskId}`,
  but that's a **mass assignment** hole without a schema (client could inject `isAdmin` etc.).
  Once the **Mongoose schema** exists (written in 5a), revisit: it becomes the allowlist and
  strips unknown fields, so taking the body wholesale becomes safe. Close the loop explicitly.
- **500 + centralised error handling** → due **Rung 6**. Status codes were formalised at
  Rung 4 (200/201/204/400/404) but **5xx was deliberately left out** — right now an unhandled
  crash falls through to Express's default handler. Rung 6 must make 500 deliberate via
  error-handling middleware, and reinforce: **bad user input is always 4xx, never 5xx.**
- **Express 5 vs Express 4 differences** → **TRIGGER FIRED — due Rung 5a.** Promised at Rung 1
  to flag it if a real difference ever bit. It bites here: in **Express 5 an async handler
  that rejects is forwarded to the error handler automatically**; in **Express 4 it is not**
  (an unhandled rejection just hangs the request — hence `express-async-handler` and wrapper
  helpers all over v4 tutorials). Teach both, because tutorials the user follows will be v4.
- **Atlas connection string is a live credential** → due **Rung 5a, before the rung's commit**.
  The string embeds the DB user's password, and every rung ends in a commit + PR, so it can
  never sit inline in `index.js`. **Decided: `.env` + `dotenv` pulled forward from Rung 6 into
  5a.** `.gitignore` already lists `.env` (added Rung 0, before the file exists — the order
  that matters), so only confirm it. Still owed: an `.env.example` (committed, no real values)
  **and a README setup step** — after 5a, `npm install` alone no longer starts the app.

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
- **Decisions:** Rung 5 **split into 5a (infrastructure) / 5b (conversion)** — 17 topics and a
  rewrite of every handler was too much for one rung. The seam is deliberately *not* reads vs
  writes: that ordering ends 5a with `GET` on Mongo and `POST` still on the array, i.e. a
  knowingly broken app at a PR boundary. Infra-vs-conversion keeps the app working throughout
  5a and leaves 5b mechanical, with the concepts already front-loaded.
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
