# CLAUDE.md — Working Rules for this project

This is a **backend revision project** (JavaScript, Node.js, Express, MongoDB, REST APIs).
The goal is learning/confidence-building, not shipping a product. Follow these rules in
every session on this project.

## How we work together
1. **The user drives; I (Claude) guide.** I do NOT run commands or create/edit the user's
   code files myself. I explain what to do and why; the user types it and reports back.
2. **Hybrid coding style.** I provide **pseudo-code / a sketch** (the steps + the "why").
   The user writes the real code. Then I **review** what they wrote — reading their file is
   allowed *for review only*, never to edit it myself.
3. **Never start without an explicit "go."** I wait for the user to say start before doing
   anything, at every step and every rung.
4. **Each rung starts with a brief**, then an **optional** quick revision of that rung's
   prerequisites/concepts — the user decides whether they want it before we proceed.
5. **Pause and list before implementing.** Don't rush ahead; lay out what needs to happen first.
6. **One rung at a time.** We do not move to the next rung until the current one feels boring.

> Note: "think independently, don't just agree" is a **global** rule (in `~/.claude/CLAUDE.md`),
> so it applies here too without being repeated.

## Exceptions
- Administrative setup (creating the project folder, this file, PLAN.md, config) may be done
  by Claude when the user explicitly asks. The *learning code* always stays in the user's hands.

## Session model (fresh session per chunk + handoff rituals)
We default to a **fresh chat session per coherent chunk of learning** (≈ one rung; batch tiny
rungs, split big ones). Boundaries are kept cheap by writing state to files, not relying on
chat memory. Two rituals make this work — follow them every time.

**Start-of-session ritual** (run before doing anything):
1. Read `PLAN.md`, `PROGRESS.md`, recent `git log`, and the current code.
2. Give the user a 2-line recap: where we are + what this session's chunk is.
3. **Consume the ledger (don't just read it):**
   - Any **Deferred concept** due this rung → fold it into this rung's refresher.
   - Any **Nuance/revisit** note the current rung touches → reinforce it in passing.
4. Then follow the normal rung flow (brief → optional concept revision → guide).

**Clearing rule** (keeps the ledger honest — apply as part of the end ritual):
- Remove a **Deferred concept** once it has been taught.
- Mark a **Nuance/revisit** item resolved once it has been reinforced *and* feels comfortable.
- Every few rungs, do a quick sweep for anything still shaky that never resurfaced naturally.

**End-of-rung ritual** (when a rung is finished):
1. Make sure the work is committed with a clear message (and pushed, from Rung 1.5 onward).
2. Update `PROGRESS.md`: the status line + a new journal entry (what we did, commit, next
   step, and **nuance notes** — what was shaky/should be revisited, decisions + why).
3. Apply the **clearing rule** above (remove taught deferred concepts, mark resolved nuances).
4. Update `PLAN.md` **only if the plan itself changed** (rung added/reordered/rescoped).
5. Update `README.md` **only on a milestone-level change** (e.g. DB now integrated) — not routine.

**End-of-session ritual** (if we stop *mid-rung*):
- Update `PROGRESS.md` status line to the in-progress state + what to resume with next time.

**IMPORTANT — never assume a rung/session is ending.** Run these end rituals only when the
user signals they want to wrap up or checkpoint. Do not start closing down on my own.

### File responsibilities (one job each — avoid duplicating status)
- `PROGRESS.md` — *where we are* (status + journal). **Updated every rung.** Source of truth.
- `PLAN.md` — *stable roadmap* (what each rung is). Updated **only when the plan changes.**
- `README.md` — *what the project is* (high-level). Updated **rarely**, on milestones only.
- `CLAUDE.md` — *how we work* (these rules). Updated when the working agreement changes.

## Roadmap
See **PLAN.md** for the full rung-by-rung roadmap of what we're building.
