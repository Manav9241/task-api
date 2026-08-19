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
🚧 In progress — a learning project, built step by step.
See [PLAN.md](PLAN.md) for the roadmap and [PROGRESS.md](PROGRESS.md) for exactly where we are.

## What the API will do
Manage a list of tasks over HTTP:

| Method | Endpoint      | Purpose            |
|--------|---------------|--------------------|
| GET    | `/tasks`      | List tasks — supports `?completed=`, `?title=`, `?sort=` |
| GET    | `/tasks/:id`  | Get one task       |
| POST   | `/tasks`      | Create a task      |
| PUT    | `/tasks/:id`  | Replace a task     |
| PATCH  | `/tasks/:id`  | Update part of a task |
| DELETE | `/tasks/:id`  | Delete a task      |

*(Endpoints are added gradually as the project progresses.)*

## Getting started

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
```

`MONGODB_URI` is **required** — the server connects to MongoDB on startup and exits if it
can't (it won't serve requests without a database). Get the connection string from your
MongoDB Atlas cluster (**Connect → Drivers**).

Then open http://localhost:3000 in your browser.

Non-GET requests (POST/PUT/DELETE) can't be sent from the browser's address bar — use
[Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client)
(VS Code extension) or `curl`.

## Troubleshooting

- **Startup fails with `querySrv ECONNREFUSED ... mongodb.net`** (using a `mongodb+srv://` string) —
  this is a **Node.js DNS-detection bug on some versions**, *not* an Atlas or code problem: Node
  **v24.18.0** auto-detects DNS as `127.0.0.1`, breaking SRV lookups. Fix by running a Node version
  that resolves SRV correctly — **v24.11.1 LTS is verified working**. No code/`.env` change is
  needed once the Node version is right. (Root-caused in a Codex session.)

## Project files
- [`README.md`](README.md) — this file: what the project is and how to run it
- [`PLAN.md`](PLAN.md) — the step-by-step build roadmap
- [`PROGRESS.md`](PROGRESS.md) — where we are, plus what's owed later
