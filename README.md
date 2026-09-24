# Beds

Proof of concept for managing hospital wards, beds, and patient admissions.

## Stack

| Part       | Tech                                                                  |
| ---------- | --------------------------------------------------------------------- |
| `api/`     | FastAPI, SQLAlchemy (asyncpg), [sqlc](https://sqlc.dev)-generated queries |
| `ui/`      | TanStack Router (React 19), TanStack Query/Table/Form, Tailwind, shadcn/ui |
| Database   | PostgreSQL 18 with `pg_idkit` (ULID primary keys), migrations via [dbmate](https://github.com/amacneil/dbmate) |

```text
api/app/
  routers/                  # HTTP routes: wards, beds, patients
  repositories/sql/
    migrations/             # dbmate migrations (also the sqlc schema)
    queries/                # sqlc query definitions
  repositories/generated/   # sqlc output — do not edit by hand
ui/src/
  routes/                   # file-based routes
  lib/api/generated/        # OpenAPI types generated from the running API
```

## Local setup

### Prerequisites

- [mise](https://mise.jdx.dev) — installs bun, dbmate, prek, Python 3.14,
  Infisical, sqlc, and uv from `mise.toml`
- [Docker](https://docs.docker.com/get-started/get-docker/) with Compose
- [direnv](https://direnv.net) to load `.envrc`

```sh
mise trust -y
mise install -y
prek install  # pre-commit hooks: ruff, biome, gitleaks, etc.
```

### 1. Environment

Create a `.envrc` in the repo root (gitignored):

```sh
export DBMATE_MIGRATIONS_DIR="$(pwd)/api/app/repositories/sql/migrations"
export DBMATE_NO_DUMP_SCHEMA=true
```

The API reads the `POSTGRES_*` variables; dbmate reads `DATABASE_URL`. `.envrc`
points dbmate at `api/app/repositories/sql/migrations` — without direnv, export
`DBMATE_MIGRATIONS_DIR` and `DBMATE_NO_DUMP_SCHEMA=true` yourself or pass
`--migrations-dir`.

### 2. Database

```sh
infisical run -- docker compose up --wait  # Postgres on localhost:5400
infisical run -- dbmate up  # Run initial database migrations
```

### 3. API

```sh
cd api
uv sync --dev --all-groups
infisical run -- uv run fastapi dev --host 0.0.0.0 --port 8400
```

The UI expects the API at `http://localhost:8400`.

### 4. UI

```sh
cd ui
bun install
bun run dev --port 8300  # http://localhost:8300
```

## Code generation

To change or add new data models:

```sh
# 1. Create a new migration file
dbmate new <name>
# 2. Make your DDL changes in the migration file
# 3. Apply migration
infisical run -- dbmate up
```

After changing SQL queries:

```sh
cd api && sqlc generate
```

After changing API routes or models (with the API running):

```sh
cd ui && bun run generate-api-types
```
