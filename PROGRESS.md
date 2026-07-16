# PROGRESS.md — Session Journal

> The stable roadmap lives in **PLAN.md**. This file is the *append-only journal*: where we
> are, and the nuance a fresh session would otherwise lose. Read this at the start of every
> session, update it at the end.

## Status
✅ Rung 1 done — server responds at `http://localhost:3000`.
▶ **Next: Rung 1.5 — Connect to GitHub** (private repo, auth, push).

## Deferred concepts (owed in a later rung)
> Standing debt: concepts **not taught yet, postponed on purpose** to a named rung. Keep visible
> here until covered, then remove. (Different from a session entry's *Nuance/revisit*, which is
> for concepts that *were* taught but stayed shaky.)

_None currently._

---

## Session log
> Log **only what git/PLAN/code don't already capture** — decisions (+ why), shaky spots,
> process/pace notes. No restating what we did, no commit hashes (`git log` has those). If a
> rung had nothing notable, skip the entry — the status line above is enough. Newest on top.

### (template) YYYY-MM-DD — Rung N
- **Decisions:**
- **Revisit / process:**

---

### 2026-07-16 — Rung 1
- **Decisions:** `commonjs` over ESM — most Node/Express tutorials, existing code, and
  interview questions use `require()`; ESM's quirks would distract during revision.
  On **Express 5** (tutorials are mostly v4 — near-identical for our routing, flag if it bites).
- **Revisit / process:** route matching is **top-to-bottom, first match wins** → define
  specific routes before generic ones. Taught here; **will actually bite in Rung 2**
  (`/tasks/new` vs `/tasks/:id`).

### 2026-07-16 — Rung 0
- **Decisions:** learning files tracked in git (not ignored); GitHub → Rung 1.5 (private repo).
- **Process:** don't rush ahead uninvited; trust "done"/"working" without over-verifying.
