# PLAN.md — Task/To-Do REST API (Backend Revision Roadmap)

> This file is the *what we build*. The working rules for how we collaborate are no longer in this
> repo — they moved to the workspace layer above it.

## Context
Revising backend development (JavaScript, Node.js, Express, MongoDB, REST APIs) in a
low-pressure, confidence-building way. We build a **Task/To-Do API** because it exercises
every core backend skill without domain complexity — all energy goes to the backend.
We take one small, boring step at a time and only move on when the current step feels easy.

## Build order

### Step 0 — Project & git setup (pre-code)
Pre-flight checks and version control, before any application code.

**Pre-flight checklist**
- Node.js + npm installed (`node --version`, `npm --version`) → if missing, install Node LTS
- Editor + terminal ready (VS Code assumed)
- Docs in project → `README.md`, `PLAN.md`, `PROGRESS.md`

**Git setup**
- Git installed + identity set (`git --version`; `git config --global user.name` and
  `user.email` must return values — if blank, set them, or the first commit will fail)
- `git init` — turn the folder into a git repository
- Create a **`.gitignore`** BEFORE installing anything (must ignore `node_modules/`, and
  later `.env`) so we never commit dependencies or secrets
- First commit — the docs + `.gitignore` (a clean starting point)
- Habit: **commit at the end of each step** to build a clear progress history

### Step 1 — A server that responds
- `npm init` inside the existing `task-api/` folder (creates `package.json`)
- Install `express`
- Single file `index.js` with one route `GET /` that returns "Server is running"
- Run it, open in browser, see it work
- **Success = a response in the browser. That's it.**

### Step 1.5 — Connect to GitHub (remote)
Added once local git (`add`/`commit`) feels comfortable. Local-only until here.
- Create a **private** GitHub repo (private avoids the learning-files-privacy question;
  can flip public later)
- Set up auth — Personal Access Token (HTTPS) or SSH key (GitHub no longer accepts passwords)
- Add the remote (`git remote add origin ...`) and `git push` the existing history
- From here on: **push at the end of each step**, alongside the commit

### Step 2 — Read tasks (in-memory)
- Hardcoded array of task objects
- `GET /tasks` returns the array
- `GET /tasks/:id` returns one task (intro to route params)

### Step 3 — Create tasks (in-memory)
- `express.json()` middleware
- `POST /tasks` adds a task to the array
- Test with a tool (Thunder Client / curl) since the browser can't easily POST

### Step 4 — Full CRUD (in-memory)
- `PUT/PATCH /tasks/:id` to update
- `DELETE /tasks/:id` to remove
- Proper status codes (200, 201, 404)
- **The whole REST pattern should feel repetitive/easy by here.**

### Step 5 — Add MongoDB (split: 5a + 5b + 5c)
Storage: **MongoDB Atlas** (free cloud tier) — no local install to break.
*Split three ways because databases are **new learning** for the user, not revision (see
PROGRESS's action list). The seam separates **understand → connect → convert**: each sub-step is one
mode of work, so no step mixes first-contact concepts with a code rewrite. Every sub-step is a
full step — its own branch, commit and PR. Throughout 5a and 5b the app keeps running on the
in-memory array; only 5c swaps it, so no PR boundary lands on a knowingly broken app.*

#### Step 5a — What a database is, and get one running
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
  (added Step 0, before the file exists — the order that matters); `npm i mongoose dotenv`;
  commit an `.env.example` with no real values
- **Success = a real cloud database exists, credentials safely in `.env`, and the user can
  explain what MongoDB / Atlas / Mongoose each do.** (Precedent: Step 1.5 was also pure infra.)

#### Step 5b — Connect the app and define the model
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

#### Step 5c — Swap the storage
*Mechanical: the same six routes, one repeated shape.*
- **Concepts:** `id` (number) → `_id` (ObjectId string) and what it changes for lookups, 404s
  and client-visible JSON; **CastError** on a malformed id (must not become a 500);
  `findByIdAndUpdate` options (`new`, `runValidators`) and true-replace semantics; schema
  validation vs the hand-written `if (!req.body.title)` guards (`ValidationError` → 400);
  why the status codes stay identical — that's the point of the step
- Convert GET all → GET one → POST → PUT → PATCH → DELETE (`find`, `findById`, `create`,
  `findByIdAndUpdate`, `findByIdAndDelete`)
- Delete `tasks` and `nextId`; remove 5b's throwaway log
- **Success = create a task, restart the server, GET it back.** Plus `/tasks/abc` → 400, not
  500, and the document visible in Atlas.

### Step 6 — Robustness (polish) — split: 6a + 6b
*Split two ways because 6a's error-middleware is a first-contact concept and 6b's MVC is
new-ish **architecture** the user wants taught at the architecture level — not the "mechanical
refactor" it was first billed as. Each sub-step is a full step (own branch, commit, PR). The
seam: **make it robust (6a) → make it structured (6b)** — 6b's file-split must come *after*
6a, or we'd split files then immediately rewrite them.*

#### Step 6a — Centralized error handling
- **Concept — Express error-handling middleware:** the 4-arg `(err, req, res, next)`
  signature, how Express recognises it (by arity) and routes errors to it, and `next(err)` as
  the **explicit** forwarding mechanism. Remove the per-route `try/catch` with a small
  `asyncHandler` wrapper that does `.catch(next)` — the standard, version-agnostic production
  pattern. *We forward errors explicitly; we do not lean on framework auto-forwarding.*
- Collapse the per-route `try/catch` chains (`CastError`/`ValidationError`/generic-500,
  currently repeated in all six routes) into **one** error handler that maps error → status
  code in a single place. Reinforce **bad user input = 4xx, never 5xx**.
- **Validation beyond the schema** — genuinely thin for a two-field model: add any missing
  schema validators (e.g. `maxlength` on `title`); note where *request-shape* validation would
  live in a bigger app (`express-validator`/`zod`) — concept only, deferred as scope.
- **Success = every route funnels errors through one handler; status-code behaviour is
  unchanged from 5c — that's the point.**

#### Step 6b — MVC / layered architecture
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
- ~~Environment variables (`.env`)~~ — **pulled forward to Step 5a**: the step ends in a
  commit, so an inline connection string would put a live Atlas password in git history.

### Step 7 — Query the collection: filtering, sorting, pagination (split: 7a + 7b)
*The last feature step — `GET /tasks` graduates from "return everything" to real DB querying. Split
two ways because this is genuinely **DB querying**, not a light add-on (`find(filter)` + `sort` +
`skip`/`limit` + a count), and it carries real interview traps (unbounded result sets, injection via
query params, offset-pagination pitfalls). The seam: **shape the result set (7a) → page through it
(7b)**. Each sub-step is a full step (own branch, commit, PR). **REST-style throughout** — query
params → Mongoose. GraphQL is a different API paradigm (client-driven queries over a single endpoint,
resolvers still calling Mongoose underneath), parked as a future project — not used here.*

#### Step 7a — Filtering + sorting
- **Concepts — query params:** `req.query` (values are always **strings** — `?completed=true` is the
  string `"true"`, needs coercion); how query params (`?k=v`, optional, for filtering/sorting) differ
  from route params (`/:id`, identifying one resource).
- **Concepts — filtering safely:** build the Mongoose filter from an **allowlist** of filterable keys
  only — never pass `req.query` straight into `find()` (same mass-assignment/injection reflex as the
  write-routes); `find(filter)` equality matching, and why user-supplied **operators** are a
  **NoSQL-injection** risk (`?completed[$ne]=x` arrives as an object, not a string).
- **Concepts — searching `title` (text, not equality):** exact-match on a title is useless, so search
  needs `$regex` — which means **user text is compiled into a regular expression**. Covers: escaping the
  user's input (`.`/`*` otherwise change the query's meaning), **ReDoS** from a crafted pattern,
  case-insensitivity (`$options: "i"`), and prefix (`^Topic`, index-usable) vs substring (full scan).
  *Two filter fields on purpose* — a lone boolean is self-validating, so the allowlist lesson only bites
  once a free-text field is in play.
- **Concepts — sorting:** `.sort("-createdAt")` / `{ createdAt: -1 }`; allowlist sortable fields, set a
  sensible default sort, ascending vs descending.
- **Not doing: date-range filters** (`?createdAfter=` → `{ $gte: date }`). The safe-operator pattern
  (*our* code picks the operator, user input only fills the value) is taught above; implementing it here
  would add date parsing/validation, which is plumbing, not new insight — and 7b already drills
  string→number coercion and clamping.
- **Success = `GET /tasks?completed=true&title=topic&sort=-createdAt` returns only matching tasks,
  ordered, with unknown filter/sort keys ignored (not trusted) and regex metacharacters in `title`
  treated as literal text.**

#### Step 7b — Pagination
- **Concepts — offset pagination:** `?page=&limit=` → `.skip((page-1)*limit).limit(limit)`; sensible
  defaults **and a max limit** (never serve unbounded rows); coerce/validate the numbers (bad `page` →
  clamp or 400).
- **Concepts — total count + response envelope:** `Task.countDocuments(filter)` for the total; return
  metadata (`total`, `page`, `limit`, `totalPages`, `hasNext`) alongside the data instead of a bare
  array — a deliberate **response-shape change** clients depend on.
- **Concepts — offset vs cursor (interview beat):** why `skip` degrades at scale (it still scans
  skipped rows; rows shifting mid-paging cause dupes/skips) and what **cursor/keyset** pagination does
  instead (`_id`/`createdAt` as the cursor) — concept + when to reach for it; offset is fine here.
- **Concepts — indexing (light):** why the sorted/filtered fields want an index once data grows
  (concept only; ties to the aggregation/indexing future-project idea).
- **Success = `GET /tasks?page=2&limit=10` returns page 2 with correct paging metadata, a capped max
  limit, and stable ordering. Phase 1 is then complete.**

### Later / optional
- ~~Pagination, filtering, sorting on `GET /tasks`~~ — **promoted to Step 7** (real DB querying, 7a/7b).
- **Auth (JWT) — considered and deliberately rejected for task-api.** A single-user task toy is the
  wrong home for multi-user auth. The topic itself is seeded in the workspace's `FUTURE-LEARNING.md`,
  which outlives this project.
- ~~"Blog API" as the next project~~ — **dropped** (user's call). Phase 1 ended after Step 7; phase 2
  follows below.

## Phase 2 — a container-ready application

**What it is.** task-api is reopened to take it to the next level, with Docker as a real feature of the
project:

- anyone who clones the repo can run one command and get a working API with a local database and sample
  data
- the same image runs against **Atlas** with production-like settings, and against a local MongoDB for
  development
- the application gains what running in containers expects of it, even where that means changing its
  code

**How it is worked.** Implementation-focused: each step builds something real, and the explanation of
what is being built and why comes with it — it should never feel like following a manual. How a step
runs day to day is decided once phase 2 has started. Anything handed over to run is tested first.

**Baseline.** *Known — revision:* everything phase 1 built · the Docker project's steps 1–24 (images,
multi-stage builds, environment variables, networking, healthchecks, restart policies, Compose with
several services, `depends_on` conditions) — the established terms are in that project's
`../../Docker/PROGRESS.md` coverage. *First contact:* health endpoints · connection retry · graceful
shutdown · per-environment configuration · Docker for everyday local development.

**Link to the Docker project.** Phase 2 is that project's step 25. Its work, branches and PRs live here.

Each step states where the project is before it, why the step is needed, and what is better after it.

### Step 8 — Configuration from the environment
- **Now:** the port is hardcoded to 3000, and nothing checks that `MONGODB_URI` is set until the
  connection fails.
- **Why:** every later step runs the app somewhere else — an image, Compose, two environments — and
  each needs to hand the app its settings from outside.
- **After:** one config module read at startup · `PORT` and `MONGODB_URI` from the environment, port
  defaulted · the app refuses to start with a clear message when a required value is missing ·
  `NODE_ENV` · env example files in git, real values never.

### Step 9 — Production image, and graceful shutdown
- **Now:** the API only runs where Node is installed and set up by hand, and when stopped it simply dies
  mid-request with the database connection left open.
- **Why:** an image is how the app runs identically anywhere, and platforms stop containers with
  SIGTERM and expect the app to finish cleanly.
- **After:** `Dockerfile` and `.dockerignore` in task-api · cached dependency install ·
  production-only dependencies · non-root user · running against Atlas with configuration passed in ·
  on `docker stop` the app catches SIGTERM, lets in-flight requests finish, and closes the database
  connection.

### Step 10 — Development environment with Compose, and connection retry
- **Now:** developing needs Node installed locally and an Atlas connection, and the app exits for good if
  the database isn't reachable at the moment it starts.
- **Why:** a developer should get a working setup with one command and see their edits live, and an app
  that dies whenever the database is a few seconds late can't be run reliably.
- **After:** `compose.yaml` with the API and a local MongoDB · a development stage with live reload from
  bind-mounted source · the `node_modules` problem a bind mount causes, and its fix · seeding the local
  database · the startup crash while the database is still starting, fixed by retrying the connection in
  the application.

### Step 11 — Health endpoints
- **Now:** the only check available is `GET /`, which says "Server is running" even when the database is
  down.
- **Why:** anything running the app — Docker's healthcheck now, Kubernetes next — needs to know whether
  it is alive and whether it can actually serve requests.
- **After:** liveness and readiness endpoints, readiness reporting the database connection · the app
  listening before the database is connected, so a slow start isn't mistaken for a dead process · the
  image's healthcheck using it.

### Step 12 — Environments side by side
- **Now:** development and production-like settings live in scattered commands and files, with nothing
  showing a newcomer how to run either.
- **Why:** real projects keep one base setup with a small difference per environment, and keep secrets
  out of the repository.
- **After:** a base Compose file plus development and production-like files · combining them and
  reading the result with `docker compose config` · secrets kept out of git · a README section a new
  developer can follow from a clean clone.

### Not in phase 2
Deployment, CI, pushing the image to a registry, Kubernetes (later subjects, per the workspace's
`FUTURE-LEARNING.md`) · API versioning (no step changes the API contract) · automated tests, auth,
TypeScript.

## Tech choices (minimal on purpose)
- Node.js + Express; `mongoose` + `dotenv` installed Step 5a; `dotenv` used 5a, Mongoose 5b+
- No TypeScript, no extra frameworks
- **nodemon** (devDependency, added Step 3) — auto-restarts on file change; `npm run dev`
- Testing: browser for GETs; **Thunder Client** for POST/PUT/DELETE (chosen at Step 3 over
  curl — curl's flags become a second thing to debug while learning)

## Verification
- **Steps 1–4:** run the server, hit the endpoint, confirm expected JSON / status code.
- **Step 5a:** a cloud database exists and the connection string is stored in `.env` (no app
  code yet) — nothing to run; the deliverable is the database + understanding.
- **Step 5b:** server boots, logs a successful connection, and reads back documents seeded by
  hand in the Atlas UI.
- **Step 5c+:** create a task, restart the server, GET it back — proves it persists in the DB.

## Deliberately NOT doing yet
- No auth, frontend, deployment, or test framework (Docker is phase 2)
- No folder structure until Step 6 (one file is fine and less scary early)
- No moving forward until the current step feels boring
- **No migration tooling / multi-app schema governance** (`migrate-mongo`, versioned migration
  scripts, DB-level JSON Schema validation). Our app is the *only* writer, so the multi-app
  inconsistency risk can't arise here — building the machinery would be scope creep. The
  *concepts* are taught in 5a; only the *implementation* is out of scope. What you'd add in a
  bigger system: DB-level validation as the shared referee + a versioned migration tool.
