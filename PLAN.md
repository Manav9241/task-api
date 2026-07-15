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
- [ ] Node.js + npm installed (`node --version`, `npm --version`) → if missing, install Node LTS
- [ ] Project folder → `task-api/` (done)
- [ ] Editor + terminal ready (VS Code assumed)
- [ ] Docs in project → `README.md`, `PLAN.md`, `CLAUDE.md` (done)

**Git setup**
- [ ] Git installed + identity set (`git --version`; `git config --global user.name` and
      `user.email` must return values — if blank, set them, or the first commit will fail)
- [ ] `git init` — turn the folder into a git repository
- [ ] Create a **`.gitignore`** BEFORE installing anything (must ignore `node_modules/`, and
      later `.env`) so we never commit dependencies or secrets
- [ ] First commit — the docs + `.gitignore` (a clean starting point)
- [ ] Habit: **commit at the end of each rung** to build a clear progress history

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

### Rung 5 — Add MongoDB
- Recommendation: **MongoDB Atlas** (free cloud tier) — no local install to break.
- Connect Mongoose, define a `Task` schema/model
- Swap the in-memory array for real DB calls (find, findById, create, findByIdAndUpdate,
  findByIdAndDelete). Endpoints stay the same — only storage changes.

### Rung 6 — Robustness (polish)
- Input validation (required fields, types)
- Centralized error-handling middleware
- Split into folders (routes / controllers / models) — refactor once it works
- Environment variables (`.env`) for the DB connection string

### Later / optional
- Pagination, filtering, sorting on `GET /tasks`
- Auth (JWT) — the bridge to an intermediate "Blog API"

## Tech choices (minimal on purpose)
- Node.js + Express; Mongoose from Rung 5
- No TypeScript, no extra frameworks
- Testing: browser for GETs, then Thunder Client / curl for POST/PUT/DELETE

## Verification
- **Rungs 1–4:** run the server, hit the endpoint, confirm expected JSON / status code.
- **Rung 5+:** create a task, restart the server, GET it back — proves it persists in the DB.

## Deliberately NOT doing yet
- No auth, frontend, deployment, Docker, or test framework
- No folder structure until Rung 6 (one file is fine and less scary early)
- No moving forward until the current rung feels boring
- (Rung 3) a way to test non-GET requests — Thunder Client / curl (decided then, not now)
