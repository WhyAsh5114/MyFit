# Local CockroachDB Setup

Simple Docker setup for running CockroachDB locally.

## Quick Start

```bash
# Start CockroachDB
docker-compose up -d

# Create the database
docker exec -it $(docker ps -q -f name=cockroachdb) \
  cockroach sql --insecure -e "CREATE DATABASE IF NOT EXISTS myfit;"

# Update your .env file
echo 'DATABASE_URL="postgresql://root@localhost:26257/myfit?sslmode=disable"' >> .env

# Run migrations
npx prisma migrate dev
```

## Access

- **SQL Port**: `localhost:26257`
- **Admin UI**: http://localhost:8080
- **Connection String**: `postgresql://root@localhost:26257/myfit?sslmode=disable`

## Useful Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Stop and remove data
docker-compose down -v

# View logs
docker-compose logs -f

# SQL shell
docker exec -it $(docker ps -q -f name=cockroachdb) \
  cockroach sql --insecure --database=myfit

# Check status
docker exec -it $(docker ps -q -f name=cockroachdb) \
  cockroach node status --insecure
```

## Initial Setup

After starting for the first time:

1. Create the database (command above)
2. Run `npx prisma migrate dev` to apply migrations
3. Run `npm run dev` to start the development server

That's it!
