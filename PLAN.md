# PLAN.md — Task/To-Do REST API (Backend Revision Roadmap)

> Working rules for how we collaborate live in **CLAUDE.md**. This file is the *what we build*.

## Context
Revising backend development (JavaScript, Node.js, Express, MongoDB, REST APIs) in a
low-pressure, confidence-building way. We build a **Task/To-Do API** because it exercises
every core backend skill without domain complexity — all energy goes to the backend.
We climb one small, boring rung at a time and only move on when the current rung feels easy.

## The ladder (build order)

### Rung 0 — Project & git setup (pre-code)
Pre-flight checks and version control, before any application code.

**Pre-flight checklist**
- Node.js + npm installed (`node --version`, `npm --version`) → if missing, install Node LTS
- Editor + terminal ready (VS Code assumed)
- Docs in project → `README.md`, `PLAN.md`, `CLAUDE.md`, `PROGRESS.md`

**Git setup**
- Git installed + identity set (`git --version`; `git config --global user.name` and
  `user.email` must return values — if blank, set them, or the first commit will fail)
- `git init` — turn the folder into a git repository
- Create a **`.gitignore`** BEFORE installing anything (must ignore `node_modules/`, and
  later `.env`) so we never commit dependencies or secrets
- First commit — the docs + `.gitignore` (a clean starting point)
- Habit: **commit at the end of each rung** to build a clear progress history

### Rung 1 — A server that responds
- `npm init` inside the existing `task-api/` folder (creates `package.json`)
- Install `express`
- Single file `index.js` with one route `GET /` that returns "Server is running"
- Run it, open in browser, see it work
- **Success = a response in the browser. That's it.**

### Rung 1.5 — Connect to GitHub (remote)
Added once local git (`add`/`commit`) feels comfortable. Local-only until here.
- Create a **private** GitHub repo (private avoids the learning-files-privacy question;
  can flip public later)
- Set up auth — Personal Access Token (HTTPS) or SSH key (GitHub no longer accepts passwords)
- Add the remote (`git remote add origin ...`) and `git push` the existing history
- From here on: **push at the end of each rung**, alongside the commit

### Rung 2 — Read tasks (in-memory)
- Hardcoded array of task objects
- `GET /tasks` returns the array
- `GET /tasks/:id` returns one task (intro to route params)

### Rung 3 — Create tasks (in-memory)
- `express.json()` middleware
- `POST /tasks` adds a task to the array
- Test with a tool (Thunder Client / curl) since the browser can't easily POST

### Rung 4 — Full CRUD (in-memory)
- `PUT/PATCH /tasks/:id` to update
- `DELETE /tasks/:id` to remove
- Proper status codes (200, 201, 404)
- **The whole REST pattern should feel repetitive/easy by here.**

### Rung 5 — Add MongoDB (split: 5a + 5b + 5c)
Storage: **MongoDB Atlas** (free cloud tier) — no local install to break.
*Split three ways because databases are **new learning** for the user, not revision (see
PROGRESS ledger). The seam separates **understand → connect → convert**: each sub-rung is one
mode of work, so no rung mixes first-contact concepts with a code rewrite. Every sub-rung is a
full rung — its own branch, commit and PR. Throughout 5a and 5b the app keeps running on the
in-memory array; only 5c swaps it, so no PR boundary lands on a knowingly broken app.*

#### Rung 5a — What a database is, and get one running
*Concept-heavy, light setup. No app code — `index.js` untouched, app still on the array.*
- **Concepts — databases from zero:** why persistence at all (the in-memory array vanishes on
  restart); a database is a **separate program** that stores data on disk and hands it back;
  client/server — app and DB are separate things that talk; relational (tables/rows, SQL) vs
  document (collections/documents, MongoDB) — just enough to *place* MongoDB
- **Concepts — the pieces, high level:** MongoDB (the database), Atlas (managed MongoDB in the
  cloud), Mongoose (the app-side gatekeeper / ODM) — *what each is and why*, not how yet
- **Concepts — where data integrity actually lives** (the "who guarantees shape" thread, in
  full): app-level (Mongoose) vs DB-level (SQL constraints, or MongoDB's opt-in JSON Schema
  validation); the **multi-app risk** — client-side enforcement means two apps with different
  schemas on one DB can write inconsistent data, and the DB won't referee; what **migration**
  is and how it differs relational (`ALTER TABLE`, versioned tools like EF/Flyway — DB
  enforces) vs document (no `ALTER`; update the Mongoose schema + optional transform script;
  the DB won't help you stay consistent). **Concept only** — implementing migrations/multi-app
  governance is out of scope (see *Deliberately NOT doing*)
- Create the Atlas account + cluster (**it provisions for a few minutes**); DB user; IP
  allowlist; copy the connection string
- **Understand the connection string, don't just paste it:** what each part of
  `mongodb+srv://user:password@host/dbname` actually is — so it's not an opaque blob
- Store the string in `.env` (it embeds a **live password**); confirm `.env` is already ignored
  (added Rung 0, before the file exists — the order that matters); `npm i mongoose dotenv`;
  commit an `.env.example` with no real values
- **Success = a real cloud database exists, credentials safely in `.env`, and the user can
  explain what MongoDB / Atlas / Mongoose each do.** (Precedent: Rung 1.5 was also pure infra.)

#### Rung 5b — Connect the app and define the model
*Concepts + a little code. Routes still on the array; nothing swapped yet.*
- **Concepts — Mongoose:** Schema vs Model vs Document; field types with `required` /
  `default` / `trim` / `timestamps`; `_id`, `__v` and **`strict` mode**; `mongoose.connect()`
  — where to call it, what it returns, server-start ordering
- **Concepts — async:** callbacks → promises → `async/await`; `try/catch` in route handlers,
  **incl. the real Express 5 vs 4 difference** (v5 auto-forwards a rejected promise to the
  error handler, v4 does not); which Mongoose calls return promises, and `null` vs `[]`
- Connect on boot; define the `Task` schema + model
- Seed 1–2 documents by hand in the **Atlas UI**, plus a throwaway `Task.find()` log
- **Success = server boots, logs a connection, and prints the seeded documents.**

#### Rung 5c — Swap the storage
*Mechanical: the same six routes, one repeated shape.*
- **Concepts:** `id` (number) → `_id` (ObjectId string) and what it changes for lookups, 404s
  and client-visible JSON; **CastError** on a malformed id (must not become a 500);
  `findByIdAndUpdate` options (`new`, `runValidators`) and true-replace semantics; schema
  validation vs the hand-written `if (!req.body.title)` guards (`ValidationError` → 400);
  why the status codes stay identical — that's the point of the rung
- Convert GET all → GET one → POST → PUT → PATCH → DELETE (`find`, `findById`, `create`,
  `findByIdAndUpdate`, `findByIdAndDelete`)
- Delete `tasks` and `nextId`; remove 5b's throwaway log
- **Success = create a task, restart the server, GET it back.** Plus `/tasks/abc` → 400, not
  500, and the document visible in Atlas.

### Rung 6 — Robustness (polish) — split: 6a + 6b
*Split two ways because 6a's error-middleware is a first-contact concept and 6b's MVC is
new-ish **architecture** the user wants taught at the architecture level — not the "mechanical
refactor" it was first billed as. Each sub-rung is a full rung (own branch, commit, PR). The
seam: **make it robust (6a) → make it structured (6b)** — 6b's file-split must come *after*
6a, or we'd split files then immediately rewrite them.*

#### Rung 6a — Centralized error handling
- **Concept — Express error-handling middleware:** the 4-arg `(err, req, res, next)`
  signature, how Express recognises it (by arity) and routes errors to it, and `next(err)` as
  the **explicit** forwarding mechanism. Remove the per-route `try/catch` with a small
  `asyncHandler` wrapper that does `.catch(next)` — the standard, version-agnostic production
  pattern. *We forward errors explicitly; we do not lean on framework auto-forwarding.*
- Collapse the per-route `try/catch` ladders (`CastError`/`ValidationError`/generic-500,
  currently repeated in all six routes) into **one** error handler that maps error → status
  code in a single place. Reinforce **bad user input = 4xx, never 5xx**.
- **Validation beyond the schema** — genuinely thin for a two-field model: add any missing
  schema validators (e.g. `maxlength` on `title`); note where *request-shape* validation would
  live in a bigger app (`express-validator`/`zod`) — concept only, deferred as scope.
- **Success = every route funnels errors through one handler; status-code behaviour is
  unchanged from 5c — that's the point.**

#### Rung 6b — MVC / layered architecture
- **Concept — MVC as an architecture** (taught architecture-first, not Express-first):
  separation of concerns (Model = data + domain rules, View = presentation, Controller =
  request handling/orchestration); where it came from and how the web adapted it; the **API
  wrinkle** — a JSON API has no real View (the response *is* the view), so Express "MVC" really
  means **routes → controllers → (services) → models**; why layer at all (testability,
  single-responsibility, replaceability); "fat model, skinny controller"; the honest call on
  whether a two-field app needs a **service layer**; how it sits next to layered/n-tier and
  hexagonal; and that Express MVC is a *convention*, not framework-enforced.
- Then the refactor: split `index.js` into `routes/`, `controllers/`, `models/`, `middleware/`
  (the 6a error handler moves here) once behaviour is stable.
- **Success = same API, reorganised into layers; the single-file app is gone.**
- ~~Environment variables (`.env`)~~ — **pulled forward to Rung 5a**: the rung ends in a
  commit, so an inline connection string would put a live Atlas password in git history.

### Later / optional
- Pagination, filtering, sorting on `GET /tasks`
- Auth (JWT) — the bridge to an intermediate "Blog API"

## Tech choices (minimal on purpose)
- Node.js + Express; `mongoose` + `dotenv` installed Rung 5a; `dotenv` used 5a, Mongoose 5b+
- No TypeScript, no extra frameworks
- **nodemon** (devDependency, added Rung 3) — auto-restarts on file change; `npm run dev`
- Testing: browser for GETs; **Thunder Client** for POST/PUT/DELETE (chosen at Rung 3 over
  curl — curl's flags become a second thing to debug while learning)

## Verification
- **Rungs 1–4:** run the server, hit the endpoint, confirm expected JSON / status code.
- **Rung 5a:** a cloud database exists and the connection string is stored in `.env` (no app
  code yet) — nothing to run; the deliverable is the database + understanding.
- **Rung 5b:** server boots, logs a successful connection, and reads back documents seeded by
  hand in the Atlas UI.
- **Rung 5c+:** create a task, restart the server, GET it back — proves it persists in the DB.

## Deliberately NOT doing yet
- No auth, frontend, deployment, Docker, or test framework
- No folder structure until Rung 6 (one file is fine and less scary early)
- No moving forward until the current rung feels boring
- **No migration tooling / multi-app schema governance** (`migrate-mongo`, versioned migration
  scripts, DB-level JSON Schema validation). Our app is the *only* writer, so the multi-app
  inconsistency risk can't arise here — building the machinery would be scope creep. The
  *concepts* are taught in 5a; only the *implementation* is out of scope. What you'd add in a
  bigger system: DB-level validation as the shared referee + a versioned migration tool.
