# MyFit

A comprehensive fitness platform that tracks macros, workouts, and more—powered by science-based recommendations tailored to your data.

## 🏗️ Project Structure

This is a monorepo managed with [Turborepo](https://turbo.build) and [pnpm](https://pnpm.io).

```
.
├── apps/
│   ├── api/          # Backend API (Hono + Better Auth + Prisma)
│   └── frontend/     # Web/mobile app (SvelteKit + Capacitor)
├── packages/
└── turbo.json        # Turborepo configuration
```

## 📦 What's Inside

- **[API](./apps/api/README.md)** - REST API with authentication and database (Hono + Prisma)
- **[Frontend](./apps/frontend/README.md)** - Web app and mobile clients (iOS/Android via Capacitor)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** 10+
- **PostgreSQL** (for development)

### Installation

```bash
# Clone and install
git clone https://github.com/WhyAsh5114/MyFit
cd MyFit
pnpm install
```

### Development

```bash
# Start all dev servers (API, frontend)
pnpm dev

# Frontend only
cd apps/frontend && pnpm dev

# API only
cd apps/api && pnpm dev
```

Visit `http://localhost:5173` for the frontend and `http://localhost:3000` for the API.

## 🛠️ Available Commands

Run these from the root:

```bash
pnpm dev       # Start all dev servers
pnpm build     # Build all packages
pnpm lint      # Lint all packages
pnpm format    # Format with Prettier
pnpm check     # Type-check all packages
```

## 🔗 Monorepo Patterns

### Workspace Dependencies

Packages reference each other using `workspace:*`:

```json
{
  "dependencies": {
    "@myfit/api": "workspace:*"
  }
}
```

### Turborepo Tasks

All tasks (build, lint, dev) run in dependency order. The `^` prefix ensures dependencies build first:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

## 📱 Mobile Development

The frontend is a [SvelteKit](https://kit.svelte.dev) app wrapped with [Capacitor](https://capacitorjs.com) for iOS and Android.

```bash
cd apps/frontend

# Build for web
pnpm build

# Set up mobile
pnpm exec cap sync        # Sync web assets to native projects
pnpm exec cap open ios    # Open Xcode
pnpm exec cap open android # Open Android Studio
```

See [Frontend README](./apps/frontend/README.md) for detailed mobile setup.

## 🗄️ Database

MyFit uses [Prisma](https://www.prisma.io) with a PostgreSQL database. Database files are in `apps/api/prisma/`:

- **Server-side** - Standard Prisma Client for the API
- **Browser-side** - Prisma-IDB for offline-first capabilities (used by frontend)

```bash
cd apps/api

# Generate Prisma client and Prisma-IDB
pnpm generate

# Push schema changes
pnpm push

# Open Prisma Studio
pnpm studio
```

See [API README](./apps/api/README.md) for schema and usage details.

## 🔐 Environment Variables

Create a `.env` file in each app directory. Examples:

**API** (`.env` in `apps/api`):
```
DATABASE_URL=postgresql://user:password@localhost:5432/myfit
```

**Frontend** (`.env` in `apps/frontend`):
```
PUBLIC_API_URL=http://localhost:3000
```

## 🏗️ Building for Production

```bash
# Build all packages
pnpm build

# API outputs to apps/api/dist/
# Frontend outputs to apps/frontend/build/
```

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm lint` and `pnpm format`
4. Push and create a PR

## 📚 Tech Stack

- **Frontend** - SvelteKit, Tailwind CSS, Capacitor, Paraglide (i18n)
- **Backend** - Hono, Better Auth, Prisma
- **Database** - PostgreSQL
- **Tooling** - TypeScript, Turbo, pnpm, ESLint, Prettier

## 📖 Learn More

- [Turborepo Docs](https://turbo.build/repo/docs)
- [SvelteKit Docs](https://kit.svelte.dev)
- [Hono Docs](https://hono.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
