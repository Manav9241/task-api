# PROGRESS.md — Where we are

> The stable roadmap lives in **PLAN.md**. This file holds three things with **different jobs**:
> - **Status** — where we are right now. Read first, every session.
> - **Deferred concepts** — the **action list**. Everything owed later, each with a due rung
>   or trigger. This is the only part that reliably drives action; consume it at rung start.
> - **Session log** — *history/reference only*: why we decided things. **Not reliably read,
>   and nothing in it drives action.** Never put an action item here (see CLAUDE.md rule 8).

## Status
✅ Rung 2 done — `GET /tasks` and `GET /tasks/:id` read from an in-memory array (PR #1 merged).
▶ **Next: Rung 3 — Create tasks (in-memory)**: `express.json()`, `POST /tasks`, and a tool
to test non-GET requests (Thunder Client / curl — decided at Rung 3, per PLAN).

## Deferred concepts (owed later)
> **The action list.** Anything **promised or spotted for later** — concepts to teach, traps
> to demonstrate, things to watch for. Each item states **when it's due** (a rung, or a
> trigger). Keep visible here until paid, then remove.
> **The test:** if it requires someone to DO something later, it belongs here — not the log.

- **Status codes: 404 already introduced at Rung 2** → due **Rung 4**. `res.status(404)` and
  the load-bearing `return` were taught early (a `:id` route returning nothing for a bad id is
  broken). Rung 4 must **formalise status codes across all routes (200/201/404)** and build on
  this — do NOT re-teach 404 from scratch.
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
