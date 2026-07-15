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
🚧 In progress — built rung by rung. See [PLAN.md](PLAN.md) for the full roadmap.

Current stage: **Rung 0 — project & git setup** (pre-code).

## What the API will do
Manage a list of tasks over HTTP:

| Method | Endpoint      | Purpose            |
|--------|---------------|--------------------|
| GET    | `/tasks`      | List all tasks     |
| GET    | `/tasks/:id`  | Get one task       |
| POST   | `/tasks`      | Create a task      |
| PUT    | `/tasks/:id`  | Update a task      |
| DELETE | `/tasks/:id`  | Delete a task      |

*(Endpoints are added gradually as the project progresses.)*

## Getting started
> Full setup instructions will be filled in as the project is built.

```bash
# install dependencies (once package.json exists)
npm install

# run the server
node index.js
```

Then open http://localhost:3000 in your browser.

## Project files
- [`README.md`](README.md) — this file: what the project is and how to run it
- [`PLAN.md`](PLAN.md) — the rung-by-rung build roadmap
- [`CLAUDE.md`](CLAUDE.md) — collaboration rules for working with Claude on this project
