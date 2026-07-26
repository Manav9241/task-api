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

### Rung 5 — Add MongoDB (split: 5a + 5b)
Storage: **MongoDB Atlas** (free cloud tier) — no local install to break.
*Seam = infrastructure vs conversion, deliberately **not** reads vs writes: a read/write split
would end 5a with `GET` on Mongo and `POST` on the dead array — a broken app at a PR boundary.
5a and 5b get a branch and PR each.*

#### Rung 5a — Connect the database
*The app stays on the in-memory array and keeps working; nothing is swapped yet.*
*Running order — concepts and setup interleave, they don't run end-to-end:* database concepts
→ Atlas account + create the cluster (**it provisions for a few minutes**) → Mongoose and
async concepts **while it builds** → back to Atlas for the DB user, IP allowlist and
connection string → code. Nothing in the Atlas wizard gets clicked before it's understood:
its questions (tier, region, DB user, network access) *are* the database-concepts topics.
- **Concepts — databases:** what MongoDB is (documents/collections vs rows/tables, BSON vs
  JSON); Atlas vs local install; connection-string anatomy — it embeds a **live password**;
  driver vs ODM (why Mongoose over raw `mongodb`)
- **Concepts — Mongoose:** Schema vs Model vs Document; field types with `required` /
  `default` / `trim` / `timestamps`; `_id`, `__v` and **`strict` mode**; `mongoose.connect()`
  — where to call it, what it returns, server-start ordering
- **Concepts — async:** callbacks → promises → `async/await`; `try/catch` in route handlers,
  **incl. the real Express 5 vs 4 difference** (v5 auto-forwards a rejected promise to the
  error handler, v4 does not); which Mongoose calls return promises, and `null` vs `[]`
- Atlas cluster + DB user + IP allowlist
- Confirm `.env` is already ignored (it is — added at Rung 0, *before* the file exists, which
  is the order that matters); `npm i mongoose dotenv`; commit an `.env.example` with no values
- Connect on boot; define the `Task` schema + model
- Seed 1–2 documents by hand in the **Atlas UI**, plus a throwaway `Task.find()` log
- **Success = server boots, logs a connection, and prints the seeded documents.**

#### Rung 5b — Swap the storage
*Mechanical: the same six routes, one repeated shape.*
- **Concepts:** `id` (number) → `_id` (ObjectId string) and what it changes for lookups, 404s
  and client-visible JSON; **CastError** on a malformed id (must not become a 500);
  `findByIdAndUpdate` options (`new`, `runValidators`) and true-replace semantics; schema
  validation vs the hand-written `if (!req.body.title)` guards (`ValidationError` → 400);
  why the status codes stay identical — that's the point of the rung
- Convert GET all → GET one → POST → PUT → PATCH → DELETE (`find`, `findById`, `create`,
  `findByIdAndUpdate`, `findByIdAndDelete`)
- Delete `tasks` and `nextId`; remove 5a's throwaway log
- **Success = create a task, restart the server, GET it back.** Plus `/tasks/abc` → 400, not
  500, and the document visible in Atlas.

### Rung 6 — Robustness (polish)
- Input validation **beyond** what the schema already enforces at 5b (cross-field rules,
  request-shape checks) — basic required/type validation moves into the schema at 5b
- Centralized error-handling middleware
- Split into folders (routes / controllers / models) — refactor once it works
- ~~Environment variables (`.env`)~~ — **pulled forward to Rung 5a**: the rung ends in a
  commit, so an inline connection string would put a live Atlas password in git history.

### Later / optional
- Pagination, filtering, sorting on `GET /tasks`
- Auth (JWT) — the bridge to an intermediate "Blog API"

## Tech choices (minimal on purpose)
- Node.js + Express; Mongoose from Rung 5a; `dotenv` from Rung 5a (moved up from Rung 6)
- No TypeScript, no extra frameworks
- **nodemon** (devDependency, added Rung 3) — auto-restarts on file change; `npm run dev`
- Testing: browser for GETs; **Thunder Client** for POST/PUT/DELETE (chosen at Rung 3 over
  curl — curl's flags become a second thing to debug while learning)

## Verification
- **Rungs 1–4:** run the server, hit the endpoint, confirm expected JSON / status code.
- **Rung 5a:** server boots, logs a successful connection, and reads back documents seeded by
  hand in the Atlas UI.
- **Rung 5b+:** create a task, restart the server, GET it back — proves it persists in the DB.

## Deliberately NOT doing yet
- No auth, frontend, deployment, Docker, or test framework
- No folder structure until Rung 6 (one file is fine and less scary early)
- No moving forward until the current rung feels boring
