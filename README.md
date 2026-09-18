# Task API

A **Task / To-Do REST API** built with Node.js, Express and MongoDB, packaged to run in containers:
one command gives you the API, a local database and sample data.

This is a **learning / revision project**. It was built one small, well-understood step at a time — first
the API itself (routing, CRUD, Mongoose, validation, error handling), then everything running it in
containers expects of an application. [PLAN.md](PLAN.md) is the roadmap and [PROGRESS.md](PROGRESS.md)
records what each step established, including the decisions and why they went the way they did.

🏁 **Both phases are complete.** Phase 1 built the API (steps 0–7). Phase 2 made it container-ready
(steps 8–12): configuration from the environment, a production image with graceful shutdown, a Compose
development environment with connection retry, health endpoints, and two environments side by side.

---

## Quick start

With Docker installed, from this folder:

```bash
docker compose up -d --build
```

Open <http://localhost:3000/tasks>. No Node install and no database account are needed; the details of
this environment, and of the production-like one, are under [Running it](#running-it).

## Tech stack

| Piece | Role | Notes |
|---|---|---|
| **Node.js** | runtime | pinned to **v24.11.1** — v24.18.0 breaks Atlas lookups, see [Troubleshooting](#troubleshooting) |
| **Express 5** | routing and middleware | CommonJS (`require`), not ESM |
| **MongoDB + Mongoose** | database and modelling | a local MongoDB in development, **Atlas** for production-like |
| **Docker + Compose** | how it runs | a two-stage image and three Compose files |
| **nodemon** | restart on file change | development only |

No TypeScript and no test framework: requests are tried by hand, with the browser for GETs and
[Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client) or
`curl` for everything else, since a browser's address bar can only send GET.

---

## The API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | plain text `Server is running` |
| GET | `/tasks` | list tasks — filtering, sorting and pagination, below |
| GET | `/tasks/:id` | one task |
| POST | `/tasks` | create a task |
| PUT | `/tasks/:id` | replace a task |
| PATCH | `/tasks/:id` | update part of a task |
| DELETE | `/tasks/:id` | delete a task |
| GET | `/healthz` | liveness — `200` whenever the process is running |
| GET | `/readyz` | readiness — `200` when the database is connected, `503` when it is not |

### A task

```json
{
  "_id": "6aab7af6dddc2dd4fb730ae0",
  "title": "Buy milk",
  "completed": false,
  "createdAt": "2026-09-17T05:30:00.000Z",
  "updatedAt": "2026-09-17T05:30:00.000Z"
}
```

`title` is required, trimmed, and at most 200 characters. `completed` defaults to `false`. `_id` is
MongoDB's; `createdAt` and `updatedAt` are maintained by Mongoose. Write routes read **only** `title` and
`completed` from the request body, so anything else a client sends is ignored rather than stored.

### Listing tasks

`GET /tasks` is paginated and returns an **object**, not a bare array:

```json
{
  "data": [ { "_id": "...", "title": "Buy milk", "completed": false } ],
  "page": 1,
  "limit": 10,
  "total": 57,
  "totalPages": 6,
  "hasNextPage": true
}
```

| Param | Meaning | Default |
|---|---|---|
| `completed` | `true` / `false` | not filtered |
| `title` | case-insensitive "contains" search | not filtered |
| `sort` | `createdAt`, `updatedAt`, `title`, `completed` — prefix `-` for descending | `-createdAt` |
| `page` | 1-based page number | `1` |
| `limit` | rows per page, capped at **100** | `10` |

Unrecognised or invalid values are **ignored and replaced with the default** rather than returning 400,
and a `page` past the end returns an empty `data` array, which is a valid response and not an error.

### Errors

Every route sends its errors to one handler, which answers:

| Status | When |
|---|---|
| `400` | a malformed id, or a task that fails validation (missing `title`, or one over 200 characters) |
| `404` | no task with that id |
| `500` | anything unexpected — logged in full on the server, never returned to the client |

---

## Configuration

Settings come from the environment, and `config.js` is the only file that reads them:

| Variable | Required | Default | Notes |
|---|---|---|---|
| `MONGODB_URI` | **yes** | — | `mongodb://…` for a local database, `mongodb+srv://…` for Atlas (**Connect → Drivers**) |
| `PORT` | no | `3000` | must be a whole number from 1 to 65535 |
| `NODE_ENV` | no | `development` | appears in the startup line; the image sets `production` |

**The app refuses to start** when `MONGODB_URI` is missing or `PORT` is invalid: it lists every problem it
found and exits before attempting a connection.

Where the values come from:

| Environment | Source |
|---|---|
| Development (Compose) | `compose.override.yaml` — a local database, so no `.env` is needed |
| Production-like (Compose) | `.env.production`, read by Compose's `env_file` |
| Without Docker | `.env`, read by `dotenv` |

`dotenv` never overwrites a variable that is already set, so a value passed in by Docker always beats a
`.env` file sitting in the folder — which is why development never reaches Atlas by accident.

**Secrets stay out of git.** `.gitignore` covers `.env*`, with an exception for `.env*.example`, so `.env`
and `.env.production` are ignored while `.env.example` and `.env.production.example` are tracked as the
shape to copy. `docker compose config` prints the resolved connection string, password included, so treat
its output as a secret too.

---

## Running it

Three Compose files describe two environments:

| File | Holds |
|---|---|
| `compose.yaml` | what both environments share: the build context and the 10s stop grace period |
| `compose.override.yaml` | **development** — loaded automatically: the `dev` image stage, a local MongoDB, your source folder mounted in, and the seeder |
| `compose.prod.yaml` | **production-like** — opt-in with `-f`: the `production` image stage, Atlas, no mounts, no seeder |

`docker compose config` prints the merged result of whichever files are in play, and starts nothing.

### Development

```bash
docker compose up -d --build
```

Three containers start: MongoDB, the API on <http://localhost:3000>, and a one-off `seed` container that
fills the database with 15 sample tasks and exits — `Exited (0)` is success, not a crash. Your `task-api`
folder is shared into the API container, so saving a file restarts the app inside it, with no rebuild.

```bash
docker compose logs -f api   # follow the API's output
docker compose ps -a         # all three containers, including the finished seeder
docker compose down          # stop; the database volume is kept
docker compose down -v       # stop and delete the database too
```

After changing dependencies (`npm install <package>`), run `docker compose up --build -V`. `-V` replaces
the anonymous volume holding `node_modules`, which Compose otherwise reuses with the old packages.

### Production-like, against Atlas

```bash
cp .env.production.example .env.production
# then edit .env.production and set MONGODB_URI to your Atlas connection string

docker compose -f compose.yaml -f compose.prod.yaml up -d --build
```

The API is on <http://localhost:8080>, so it runs alongside the development one. This environment:

- builds the `production` stage: production dependencies only, non-root user, `NODE_ENV=production`
- takes its settings from the git-ignored `.env.production`
- uses the `HEALTHCHECK` baked into the image, so `docker compose ps` reports `(healthy)`
- restarts unless you stop it (`restart: unless-stopped`)
- runs under its own Compose project name, `task-api-prod`, so it cannot collide with development

```bash
docker compose -f compose.yaml -f compose.prod.yaml ps
docker compose -f compose.yaml -f compose.prod.yaml logs -f api
docker compose -f compose.yaml -f compose.prod.yaml down
```

### The production image on its own

The image `compose.prod.yaml` builds also runs by itself:

```bash
docker build -t task-api .
docker run -d --name task-api --stop-timeout 10 -p 3000:3000 --env-file .env.production task-api
```

`--stop-timeout 10` gives Docker a longer wait than the app's own 5-second shutdown deadline, so the app
always finishes shutting down on its own terms.

### Without Docker

Needs Node v24.11.1 and a MongoDB you can reach, such as Atlas.

```bash
# install dependencies
npm install

# set up environment variables
cp .env.example .env
# then edit .env and set MONGODB_URI to your connection string

# run in development (auto-restarts on file changes)
npm run dev

# or run it plainly
npm start

# optional: fill the database with sample tasks to page through
npm run seed          # 15 tasks
npm run seed -- 40    # or however many
```

`npm run seed` only removes and recreates tasks titled `Seed task NN`, so it never touches tasks you
created yourself. Then open <http://localhost:3000>.

---

## How it starts and stops

- **It listens first, then connects.** The port opens immediately, so a database that is slow to arrive
  is not mistaken for a dead process. `/readyz` is what reports whether the app can actually serve;
  requests needing the database before it is ready wait about 10 seconds and then fail.
- **It retries the connection** — 1s, 2s, 4s, doubling up to 30s — logging each failed attempt instead of
  exiting. After the first success, Mongoose handles any later reconnection itself.
- **It shuts down gracefully.** On SIGTERM it stops accepting connections, gives requests in progress
  5 seconds to finish, closes anything still open, closes the database connection, and exits with code 0.
  Exit code `137` means it was killed instead, which should not happen while Docker's wait is longer.
- **Health is checked in two places:** the image carries a `HEALTHCHECK`, and `compose.override.yaml`
  defines one for development. Both call `/readyz`.

## Project structure

```
index.js         composition only: middleware, routes, error handler, start and stop
config.js        the one place that reads process.env, with validation
routes/          taskRoutes.js, healthRoutes.js         paths → controller functions
controllers/     taskController.js, healthController.js request handling
models/          task.js                                the Mongoose schema and model
middleware/      asyncHandler.js, errorHandler.js       forwarding async errors; the one error handler
utils/           AppError.js                            an error type that carries a status code
scripts/         seed.js                                sample data; run by a human, never imported
Dockerfile       two stages: dev (nodemon) and production (default)
compose*.yaml    base, development, production-like
```

Validation rules live on the schema, controllers stay thin, and there is no service layer: a two-field
CRUD app has no logic that would justify one.

---

## Troubleshooting

- **Startup fails with `querySrv ECONNREFUSED … mongodb.net`** (with a `mongodb+srv://` string) — a
  **Node DNS-detection bug in some versions**, not an Atlas or code problem: **v24.18.0** detects DNS as
  `127.0.0.1` and breaks SRV lookups. Run **v24.11.1**, which is verified working; no code or `.env`
  change is needed. (Root-caused in a Codex session.)

- **Startup hangs with no `MongoDB connected` line** — your current IP is probably missing from the Atlas
  allowlist, which changes whenever your network does. Add it under **Network Access** in Atlas.

- **A container is `unhealthy` while its own logs look fine** — the reason is in the check's output, not
  the container's log:

  ```bash
  docker inspect -f '{{json .State.Health}}' task-api-api-1
  ```

- **`Cannot find module '<package>'` after installing it** — the container is still using the old
  `node_modules` volume. Rebuild with `docker compose up --build -V`.

- **A change to the `production` stage seems to have no effect in development** — Compose only builds the
  stage named by `target`, so the `production` stage is never built by `docker compose up`. Check what the
  image actually carries:

  ```bash
  docker image inspect -f '{{json .Config.Healthcheck}}' task-api
  ```

---

## Project files

- [`README.md`](README.md) — this file: what the project is and how to run it
- [`PLAN.md`](PLAN.md) — the step-by-step roadmap for both phases
- [`PROGRESS.md`](PROGRESS.md) — current state and what each step established; phase 1's decision log is
  kept at the bottom
