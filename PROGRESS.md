# PROGRESS.md — Session Journal

> The stable roadmap lives in **PLAN.md**. This file is the *append-only journal*: where we
> are, and the nuance a fresh session would otherwise lose. Read this at the start of every
> session, update it at the end.

## Status
✅ Rung 2 done — `GET /tasks` and `GET /tasks/:id` read from an in-memory array (PR #1 merged).
▶ **Next: Rung 3 — Create tasks (in-memory)**: `express.json()`, `POST /tasks`, and a tool
to test non-GET requests (Thunder Client / curl — decided at Rung 3, per PLAN).

## Deferred concepts (owed later)
> Standing debt: anything **promised or spotted for later** — concepts to teach, traps to
> demonstrate, things to watch for. Each item states **when it's due** (a rung, or a trigger).
> Keep visible here until paid, then remove. (Different from a session entry's
> *Nuance/revisit*, which is history and scrolls away.)

- **Express 5 vs Express 4 differences** → due **on trigger**: we're on Express 5 while most
  tutorials are v4. Near-identical for basic routing, but **flag it explicitly if a real
  difference ever bites** (I promised this at Rung 1).

---

## Session log
> Log **only what git/PLAN/code don't already capture** — decisions (+ why), shaky spots,
> process/pace notes. No restating what we did, no commit hashes (`git log` has those). If a
> rung had nothing notable, skip the entry — the status line above is enough. Newest on top.

### (template) YYYY-MM-DD — Rung N
- **Decisions:**
- **Revisit / process:**

---

### 2026-07-16 — Rung 2
- **Decisions:** pulled **404 + `res.status()` forward from Rung 4** — a `:id` route that
  returns nothing for a bad id is just broken. Rung 4 should formalise status codes across
  all routes rather than introducing 404 from scratch.

### 2026-07-16 — Rung 1.5
- **Decisions:** SSH over PAT — tokens expire and are a live secret to store; SSH keys don't
  expire and nothing gets pasted after setup. Key generated **without a passphrase** —
  accepted tradeoff for a private learning repo (note: the key is machine-wide, so if it's
  ever reused for work repos, revisit this).

### 2026-07-16 — Rung 1
- **Decisions:** `commonjs` over ESM — most Node/Express tutorials, existing code, and
  interview questions use `require()`; ESM's quirks would distract during revision.
  On **Express 5** (tutorials are mostly v4 — near-identical for our routing, flag if it bites).
- **Revisit / process:** switched from pseudo-code sketches to reference-code style (user
  types it themselves) — sketches were slower/more frustrating for revision.

### 2026-07-16 — Rung 0
- **Decisions:** learning files tracked in git (not ignored); GitHub → Rung 1.5 (private repo).
- **Process:** don't rush ahead uninvited; trust "done"/"working" without over-verifying.
