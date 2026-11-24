# 🗄️ Database — Initial Setup Dump

This folder contains a full PostgreSQL dump of the Society Management Portal database, generated from a freshly seeded instance.

## What's inside `init.sql`

| Included | Details |
|---------|---------|
| ✅ All ENUMs | `AMCStatus`, `Role`, `FlatType`, `BlockType`, `SocietyStatus`, etc. |
| ✅ All 30+ tables | Full schema with constraints, indexes, and foreign keys |
| ✅ Prisma migrations table | `_prisma_migrations` — marks all migrations as applied |
| ✅ Seed data | Default society (id=1), 12 EAV settings, default admin user |
| ✅ Sequences reset | All `SERIAL` sequences advanced past seeded rows |

### Default seeded credentials

| Field | Value |
|-------|-------|
| Account Number | `2026011001` |
| Username | `admin` |
| Password | `admin123` |
| Role | `admin` |

> ⚠️ **Change the admin password immediately after first login in production.**

---

## When to use this dump

### Option A — Skip the dump (recommended default)

The Docker Compose setup auto-runs `prisma migrate deploy` + `prisma db seed` on every backend start. **You do not need this file for the normal Docker workflow.**

```bash
docker compose up --build   # migrations + seed run automatically
```

### Option B — Use this dump (faster or when Prisma is unavailable)

Use `init.sql` when:
- You want a guaranteed-identical database state (e.g. CI/CD environment)
- You are setting up a managed PostgreSQL database (AWS RDS, Supabase, Neon, etc.)
- You need to skip running Node/Prisma entirely on the target server
- You want to clone the database to a new server quickly

---

## How to restore

### Into the Docker Compose database container (local)

```bash
# 1. Start only the db service
docker compose up -d db

# 2. Wait for it to be healthy
docker compose ps

# 3. Restore the dump
docker exec -i society_db psql -U society_user -d society_db < database/init.sql

# 4. Start the rest of the stack (skip seed since data is already there)
docker compose up -d backend frontend
```

### Into a remote / managed PostgreSQL database

```bash
# Using psql (install PostgreSQL client tools locally if needed)
psql "postgresql://user:password@your-db-host:5432/society_db" < database/init.sql

# Using pg_restore is NOT needed — this is a plain SQL dump (not custom format)
```

### Into a local bare-metal PostgreSQL

```bash
# Create the database and user first (skip if already done)
sudo -u postgres psql -c "CREATE USER society_user WITH PASSWORD 'society_pass';"
sudo -u postgres psql -c "CREATE DATABASE society_db OWNER society_user;"

# Restore
psql -U society_user -d society_db -h localhost < database/init.sql
```

### Into Supabase / Neon / Railway / AWS RDS

These services provide a connection string. Use it directly:

```bash
psql "postgresql://user:pass@host:5432/dbname?sslmode=require" < database/init.sql
```

---

## How to regenerate this dump

Run this against a live, freshly-seeded container:

```bash
# 1. Dump inside the container (avoids Windows encoding issues)
docker exec society_db pg_dump \
  -U society_user \
  -d society_db \
  --no-owner \
  --no-acl \
  -f /tmp/init.sql

# 2. Copy out to local filesystem
docker cp society_db:/tmp/init.sql database/init.sql
```

> **Tip:** Always regenerate after running new Prisma migrations so the dump stays in sync with the schema.

---

## Notes

- The dump uses `--no-owner` and `--no-acl` — it does not hardcode the `society_user` role into ownership statements, so it can be restored into any database user.
- The `\restrict` / `\unrestrict` lines at the top and bottom of the file are pg_dump password-file directives — PostgreSQL silently ignores them during restore; they are harmless.
- The dump is in **plain SQL format** (not `pg_dump -Fc` custom format). Restore with `psql`, not `pg_restore`.
