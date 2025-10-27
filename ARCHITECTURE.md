# Architecture Documentation

## Overview

MyFit is a progressive web application (PWA) for tracking workouts and managing progressive overload in strength training. The application is built with modern web technologies and follows a full-stack TypeScript architecture with server-side rendering capabilities.

## Technology Stack

### Frontend

- **Framework**: SvelteKit 2.x with Svelte 5
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom theming
- **UI Components**: Custom component library built on bits-ui and shadcn-style patterns
- **State Management**: Svelte 5 runes system for reactive state
- **Data Visualization**: Chart.js with date-fns adapter
- **PWA**: Vite PWA plugin with Workbox for service worker management

### Backend

- **API Layer**: tRPC for end-to-end type-safe APIs
- **Authentication**: Auth.js (formerly NextAuth) with Google and GitHub OAuth providers
- **Database**: CockroachDB (PostgreSQL-compatible)
- **ORM**: Prisma 6.0 with multi-file schema organization
- **Legacy Data**: MongoDB for V2 data migration support

### Build & Development

- **Build Tool**: Vite 6.0
- **Deployment**: Vercel with SvelteKit adapter
- **Testing**: Playwright for end-to-end testing
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## Project Structure

```
MyFit/
├── prisma/                          # Database layer
│   ├── migrations/                  # Database migration history
│   └── schema/                      # Modular Prisma schemas
│       ├── schema.prisma           # Main schema with User & Auth models
│       ├── enums.prisma            # Shared enum definitions
│       ├── exerciseSplit.prisma    # Exercise split entities
│       ├── mesocycle.prisma        # Mesocycle entities
│       └── workout.prisma          # Workout entities
│
├── src/
│   ├── lib/                        # Shared library code
│   │   ├── trpc/                   # tRPC configuration & routes
│   │   │   ├── router.ts           # Main tRPC router
│   │   │   ├── context.ts          # Request context creation
│   │   │   ├── t.ts                # tRPC instance configuration
│   │   │   └── routes/             # API route handlers
│   │   │       ├── workouts.ts     # Workout CRUD & progression logic
│   │   │       ├── mesocycles.ts   # Mesocycle management
│   │   │       ├── exerciseSplits.ts # Exercise split management
│   │   │       └── users.ts        # User settings & V2 migration
│   │   │
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ui/                 # Base UI primitives
│   │   │   ├── mesocycleAndExerciseSplit/ # Domain-specific components
│   │   │   └── settings/           # Settings page components
│   │   │
│   │   ├── utils/                  # Business logic utilities
│   │   │   ├── mesocycleUtils.ts   # Mesocycle calculations
│   │   │   ├── workoutUtils.ts     # Progressive overload algorithms
│   │   │   ├── types.ts            # Shared type definitions
│   │   │   └── userCreation.ts     # User onboarding logic
│   │   │
│   │   ├── stores/                 # Client-side state stores
│   │   │   └── quoteFrequencyRunes.svelte.ts # Quote display settings
│   │   │
│   │   ├── common/                 # Common data & templates
│   │   │   ├── commonExercises.ts  # Exercise database
│   │   │   └── exerciseSplitTemplates.ts # Pre-built workout splits
│   │   │
│   │   ├── mongo/                  # Legacy MongoDB connection
│   │   ├── V2/                     # V2 migration types & logic
│   │   ├── zodSchemas/             # Generated Zod schemas from Prisma
│   │   ├── prisma.ts               # Prisma client singleton
│   │   └── utils.ts                # Generic utility functions
│   │
│   ├── routes/                     # SvelteKit routes (file-based routing)
│   │   ├── +layout.server.ts       # Root layout server load
│   │   ├── +layout.svelte          # Root layout component
│   │   ├── +page.svelte            # Landing page
│   │   ├── dashboard/              # Dashboard views
│   │   ├── workouts/               # Workout management
│   │   ├── mesocycles/             # Mesocycle views
│   │   ├── exercise-splits/        # Exercise split management
│   │   ├── exercise-stats/         # Exercise statistics
│   │   ├── settings/               # User settings
│   │   ├── profile/                # User profile
│   │   ├── docs/                   # Documentation
│   │   └── (components)/           # Route-level shared components
│   │
│   ├── hooks.server.ts             # SvelteKit server hooks (auth & tRPC)
│   ├── service-worker.ts           # PWA service worker
│   ├── app.html                    # HTML template
│   └── app.pcss                    # Global styles
│
├── static/                         # Static assets
│   ├── robots.txt
│   ├── sitemap.xml
│   └── [icons & screenshots]
│
└── tests/                          # E2E test suite
    ├── global-setup.ts             # Test environment setup
    ├── fixtures.ts                 # Test fixtures & utilities
    └── [test files]
```

## Core Architecture Patterns

### Data Model

The application follows a hierarchical data model:

```
User
  ├── ExerciseSplit (reusable workout templates)
  │     └── ExerciseSplitDay
  │           └── ExerciseTemplate
  │
  ├── Mesocycle (training program instances)
  │     ├── MesocycleExerciseSplitDay (copied from ExerciseSplit)
  │     │     └── MesocycleExerciseTemplate
  │     ├── MesocycleCyclicSetChange (volume adjustment rules)
  │     └── WorkoutOfMesocycle (workout assignments)
  │
  └── Workout (completed training sessions)
        └── WorkoutExercise
              └── WorkoutExerciseSet
                    └── WorkoutExerciseMiniSet (for advanced set types)
```

### Key Domain Concepts

**Exercise Split**: A weekly training structure defining which muscle groups are trained on which days. Reusable across multiple mesocycles.

**Mesocycle**: A complete training program spanning multiple weeks with specific exercises, rep ranges, and progression parameters. When created, it copies an exercise split template and can be independently modified.

**Workout**: A single training session recording actual performance data including reps, load, and RIR (Reps in Reserve).

**Progressive Overload**: Automatic calculation of target performance based on previous workout data using the Berger formula and custom algorithms.

### Authentication & Authorization

- OAuth-based authentication via Auth.js
- Session management with Prisma adapter
- User context injection via tRPC middleware
- All API routes require authentication (401 if not logged in)

### API Architecture

The application uses tRPC for type-safe API communication:

**Router Structure**:

```typescript
router
  ├── exerciseSplits
  │     ├── findById
  │     ├── load (paginated)
  │     ├── loadAllNames
  │     ├── create
  │     ├── editById
  │     └── deleteById
  │
  ├── mesocycles
  │     ├── findById
  │     ├── findActiveMesocycle
  │     ├── load (paginated)
  │     ├── create
  │     ├── edit
  │     ├── updateExerciseSplit
  │     ├── start
  │     ├── end
  │     └── deleteById
  │
  ├── workouts
  │     ├── findById
  │     ├── loadLatest
  │     ├── findTodaysWorkout
  │     ├── loadLatestForMesocycle
  │     ├── generateWorkoutExercises (progressive overload)
  │     ├── create
  │     ├── edit
  │     └── deleteById
  │
  └── users
        ├── getUserSettings
        ├── updateQuoteSettings
        ├── checkV2DataAvailable
        └── migrateV2Data
```

### Progressive Overload Algorithm

The core training intelligence uses the Berger formula to calculate optimal load progression:

**Formula Components**:

- Previous performance (reps, load, RIR)
- User bodyweight (for bodyweight exercises)
- Target overload percentage
- Rep range constraints
- Set type (Straight, Drop, Myorep, etc.)

**Calculation Flow**:

1. Retrieve previous workout for same exercise and split day
2. Calculate volume-adjusted performance using Berger formula
3. Apply overload percentage (configurable per mesocycle/exercise)
4. Adjust for bodyweight changes
5. Generate target reps within specified range
6. Handle special set types (drop sets, myoreps, etc.)

### Database Schema Organization

Prisma schema is split into logical modules:

**schema.prisma**: Core user and authentication tables (User, Account, Session, VerificationToken, UserSettings)

**enums.prisma**: Shared enumerations (MuscleGroup, SetType, ChangeType, WorkoutStatus, QuotesDisplayMode)

**exerciseSplit.prisma**: Exercise split templates (ExerciseSplit, ExerciseSplitDay, ExerciseTemplate)

**mesocycle.prisma**: Training program definitions (Mesocycle, MesocycleExerciseSplitDay, MesocycleExerciseTemplate, MesocycleCyclicSetChange)

**workout.prisma**: Workout logs (Workout, WorkoutOfMesocycle, WorkoutExercise, WorkoutExerciseSet, WorkoutExerciseMiniSet)

### State Management

**Server State**: Managed by tRPC with automatic invalidation and refetching

**Client State**: Svelte 5 runes for reactive local state

- `$state`: Reactive variables
- `$derived`: Computed values
- `$effect`: Side effects

**Persistent State**: LocalStorage for user preferences (quote settings, theme)

### Service Worker & PWA

The application implements a custom service worker strategy:

**Caching Strategy**:

- **Cache-First**: Static assets (styles, fonts, icons, images)
- **Network-Only**: Dynamic API calls with offline fallback
- **Precaching**: Pre-rendered pages (privacy policy, offline, docs)

**Offline Support**:

- Cached static resources available offline
- Fallback to `/offline` page when network unavailable
- Service worker updates prompt users to reload

### UI Architecture

**Responsive Design**: Separate layout components for mobile and desktop viewports (breakpoint at 1024px)

**Component Library**: Custom components built on headless UI primitives (bits-ui)

- Buttons, inputs, dialogs, drawers
- Cards, accordions, tabs
- Command palette (cmdk)
- Charts and data visualization

**Theming**: CSS custom properties with dark/light mode support via mode-watcher

### Data Validation

**Input Validation**: Zod schemas auto-generated from Prisma models using zod-prisma-types

**Type Safety**: Full end-to-end type safety from database to frontend via Prisma + tRPC

**Runtime Validation**: All API inputs validated with Zod before processing

### Migration System

**V2 to V3 Migration**:

- Legacy data stored in MongoDB
- One-time migration process converts V2 data to V3 schema
- Migration flag prevents duplicate migrations
- Supports workout history, mesocycle templates, and user preferences

## Performance Optimizations

### Build Optimizations

- Vite's optimized dependency pre-bundling
- Tree-shaking for unused code elimination
- Code splitting for route-based chunks
- CSS purging via TailwindCSS

### Runtime Optimizations

- SvelteKit SSR for initial page load performance
- Progressive hydration
- Service worker precaching for instant navigation
- Infinite scroll pagination for large data sets

### Database Optimizations

- Indexed queries on user-scoped data
- Selective field inclusion to reduce payload size
- Cursor-based pagination
- Cascading deletes to maintain referential integrity

## Testing Strategy

**E2E Testing**: Playwright tests covering critical user flows

- User authentication
- Exercise split creation and management
- Mesocycle creation and lifecycle
- Workout logging and progression
- Data validation and edge cases

**Test Environment**:

- Isolated test database
- Global setup/teardown for environment preparation
- Fixture-based test data generation
- Parallel test execution with retry logic

## Deployment Architecture

**Platform**: Vercel serverless platform

**Build Process**:

1. Install dependencies
2. Generate Prisma client
3. Build SvelteKit application
4. Generate service worker with Workbox
5. Deploy to Vercel edge network

**Environment Variables**:

- `DATABASE_URL`: CockroachDB connection string
- `MONGODB_URI`: Legacy V2 database (optional)
- `AUTH_SECRET`: Auth.js secret key
- `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`: GitHub OAuth
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`: Google OAuth

## Security Considerations

**Authentication**: OAuth 2.0 via trusted providers (Google, GitHub)

**Authorization**: User-scoped queries prevent cross-user data access

**Input Sanitization**: Markdown rendering with DOMPurify for XSS prevention

**HTTPS Only**: Enforced in production via Vercel

**Session Management**: Secure HTTP-only cookies via Auth.js

## Future Architecture Considerations

**Scalability**: CockroachDB provides horizontal scaling capabilities for growing user base

**Observability**: Structured for future addition of logging, monitoring, and analytics

**API Versioning**: tRPC router structure allows for versioned API endpoints if needed

**Mobile Native**: PWA architecture provides foundation for potential native app wrapper

**Real-time Features**: Architecture supports WebSocket integration for live updates

**Multi-tenancy**: Database schema supports team/shared workout features with minimal changes
