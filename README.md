# Task API

A simple **Task / To-Do REST API** built with Node.js, Express, and MongoDB.

This is a **learning / revision project** — the goal is to rebuild backend fundamentals
(routing, CRUD, Mongoose, validation, error handling) by building the API one small,
well-understood step at a time, rather than shipping a product.

## Tech stack
- **Node.js** — JavaScript runtime
- **Express** — web framework / routing
- **MongoDB** + **Mongoose** — database & modelling (added partway through)

## Status
🔵 **Phase 2 in progress** — making the API container-ready, with Docker as a feature of the project.
Phase 1 (the API itself, Steps 0–7) is complete. See [PLAN.md](PLAN.md) for both phases and
[PROGRESS.md](PROGRESS.md) for where the work stands.

## What the API does
Manage a list of tasks over HTTP:

| Method | Endpoint      | Purpose            |
|--------|---------------|--------------------|
| GET    | `/tasks`      | List tasks — supports `?completed=`, `?title=`, `?sort=`, `?page=`, `?limit=` |
| GET    | `/tasks/:id`  | Get one task       |
| POST   | `/tasks`      | Create a task      |
| PUT    | `/tasks/:id`  | Replace a task     |
| PATCH  | `/tasks/:id`  | Update part of a task |
| DELETE | `/tasks/:id`  | Delete a task      |
| GET    | `/healthz`    | Liveness — `200` whenever the process is running |
| GET    | `/readyz`     | Readiness — `200` when the database is connected, `503` when it is not |

The server starts listening **before** the database is connected and keeps retrying in the background,
so `/readyz` is what says whether it can serve. Both the image (`HEALTHCHECK`) and `compose.yaml` check
`/readyz`, so `docker compose ps` reports the API as `(healthy)` or `(unhealthy)`.

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

Unrecognised or invalid values are **ignored and replaced with the default** rather than returning 400.
A `page` past the end returns an empty `data` array, which is a valid response and not an error.

## Getting started with Docker (no Node or Atlas needed)

```bash
docker compose up -d --build
```

That starts three containers: MongoDB, the API on http://localhost:3000, and a one-off `seed` container
that fills the database with 15 sample tasks and exits (`Exited (0)` is success). Your `task-api` folder
is shared into the API container, so saving a file restarts the app inside it — no rebuild.

```bash
docker compose logs -f api   # follow the API's output
docker compose ps -a         # all three containers, including the finished seeder
docker compose down          # stop; the database volume is kept
docker compose down -v       # stop and delete the database too
```

After changing dependencies (`npm install <package>`), run `docker compose up --build -V`. `-V` replaces
the anonymous volume holding `node_modules`, which Compose otherwise reuses with the old packages.

Development uses a local MongoDB, never Atlas: `compose.yaml` sets `MONGODB_URI`, and `dotenv` does not
overwrite a variable that is already set, so the `.env` in your folder is ignored inside the container.

## Getting started without Docker

```bash
# install dependencies
npm install

# set up environment variables
cp .env.example .env
# then edit .env and set MONGODB_URI to your MongoDB connection string

# run in development (auto-restarts on file changes)
npm run dev

# or run it plainly
npm start

# optional: fill the database with sample tasks to page through
npm run seed          # 15 tasks
npm run seed -- 40    # or however many
```

`npm run seed` only removes and recreates tasks titled `Seed task NN`, so it will not touch
tasks you created yourself.

`MONGODB_URI` is **required** — the server connects to MongoDB on startup and **retries** until it
succeeds (1s, 2s, 4s… capped at 30s), logging each failed attempt, rather than serving requests without
a database. `PORT` (default `3000`) and `NODE_ENV` (default
`development`) are optional. The app refuses to start, with a message naming the problem, if
`MONGODB_URI` is missing or `PORT` is not a valid port. Get the connection string from your
MongoDB Atlas cluster (**Connect → Drivers**).

Then open http://localhost:3000 in your browser.

### Run with Docker

```bash
docker build -t task-api .
docker run -d --name task-api --stop-timeout 10 -p 3000:3000 --env-file .env task-api
```

The image runs Node 24.11.1 as a non-root user with production dependencies only; `.env` is passed in at
run time and never copied into the image. On `docker stop` the app finishes open requests (up to 5
seconds), closes the database connection and exits with code 0. `--stop-timeout 10` makes Docker wait
longer than that before force-killing it.

Non-GET requests (POST/PUT/DELETE) can't be sent from the browser's address bar — use
[Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client)
(VS Code extension) or `curl`.

## Troubleshooting

- **Startup fails with `querySrv ECONNREFUSED ... mongodb.net`** (using a `mongodb+srv://` string) —
  this is a **Node.js DNS-detection bug on some versions**, *not* an Atlas or code problem: Node
  **v24.18.0** auto-detects DNS as `127.0.0.1`, breaking SRV lookups. Fix by running a Node version
  that resolves SRV correctly — **v24.11.1 LTS is verified working**. No code/`.env` change is
  needed once the Node version is right. (Root-caused in a Codex session.)

- **Startup hangs with no `MongoDB connected` line** — your current IP address is probably not on the
  Atlas allowlist (it changes when your network does). Add it under **Network Access** in Atlas.

## Project files
- [`README.md`](README.md) — this file: what the project is and how to run it
- [`PLAN.md`](PLAN.md) — the step-by-step build roadmap
- [`PROGRESS.md`](PROGRESS.md) — current state and what each step established; phase 1's decision log is
  kept at the bottom
