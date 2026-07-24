# PROGRESS.md — Where we are

> The stable roadmap lives in **PLAN.md**. This file holds three things with **different jobs**:
> - **Status** — where we are right now. Read first, every session.
> - **Deferred concepts** — the **action list**. Everything owed later, each with a due rung
>   or trigger. This is the only part that reliably drives action; consume it at rung start.
> - **Session log** — *history/reference only*: why we decided things. **Not reliably read,
>   and nothing in it drives action.** Never put an action item here (see CLAUDE.md rule 9).

## Status
✅ Rung 4 done — full CRUD in memory (GET/POST/PUT/PATCH/DELETE), status codes formalised.
▶ **Next: Rung 5 — Add MongoDB**: Atlas cluster, Mongoose schema/model, swap the in-memory
array for DB calls. Endpoints stay the same; only storage changes.
⚠️ Two Deferred items come due at Rung 5 — read them before starting.

## Deferred concepts (owed later)
> **The action list.** Anything **promised or spotted for later** — concepts to teach, traps
> to demonstrate, things to watch for. Each item states **when it's due** (a rung, or a
> trigger). Keep visible here until paid, then remove.
> **The test:** if it requires someone to DO something later, it belongs here — not the log.

- **PUT semantics vs mass assignment** → due **Rung 5/6**. Rung 4's PUT hardcodes an
  allowlist (`{id, title, completed}`), so it **silently ignores any other field the client
  sends** — not true "replace the resource". The pure version is `{...req.body, id: taskId}`,
  but that's a **mass assignment** hole without a schema (client could inject `isAdmin` etc.).
  Once the **Mongoose schema** exists (Rung 5), revisit: the schema becomes the allowlist and
  strips unknown fields, so taking the body wholesale becomes safe. Close the loop explicitly.
- **500 + centralised error handling** → due **Rung 6**. Status codes were formalised at
  Rung 4 (200/201/204/400/404) but **5xx was deliberately left out** — right now an unhandled
  crash falls through to Express's default handler. Rung 6 must make 500 deliberate via
  error-handling middleware, and reinforce: **bad user input is always 4xx, never 5xx.**
- **Express 5 vs Express 4 differences** → due **on trigger**: we're on Express 5 while most
  tutorials are v4. Near-identical for basic routing, but **flag it explicitly if a real
  difference ever bites** (I promised this at Rung 1).

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
