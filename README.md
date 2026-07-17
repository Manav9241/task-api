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
🚧 In progress — a learning project, built rung by rung.
See [PLAN.md](PLAN.md) for the roadmap and [PROGRESS.md](PROGRESS.md) for exactly where we are.

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

```bash
# install dependencies
npm install

# run in development (auto-restarts on file changes)
npm run dev

# or run it plainly
npm start
```

Then open http://localhost:3000 in your browser.

Non-GET requests (POST/PUT/DELETE) can't be sent from the browser's address bar — use
[Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client)
(VS Code extension) or `curl`.

## Project files
- [`README.md`](README.md) — this file: what the project is and how to run it
- [`PLAN.md`](PLAN.md) — the rung-by-rung build roadmap
- [`PROGRESS.md`](PROGRESS.md) — where we are, plus what's owed later
- [`CLAUDE.md`](CLAUDE.md) — collaboration rules for working with Claude on this project
