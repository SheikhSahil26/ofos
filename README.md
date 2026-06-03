# ProjectGuider — Node.js + Express + TypeScript Boilerplate

> A production-ready folder structure guide for backend applications.
> This boilerplate demonstrates best practices used in real production systems.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Data Flow (Request Lifecycle)](#data-flow-request-lifecycle)
- [Getting Started](#getting-started)
- [Choose Your Database / ORM](#choose-your-database--orm)
- [Module Architecture](#module-architecture)
- [Key Concepts for Trainees](#key-concepts-for-trainees)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Adding a New Module (Step-by-Step)](#adding-a-new-module-step-by-step)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## Architecture Overview

This project follows a **modular, layered architecture**:

```
Request → Route → Middleware(s) → Controller → Service → Repository → Database
```

| Layer          | Responsibility                                          | Talks To           |
| -------------- | ------------------------------------------------------- | ------------------- |
| **Route**      | Defines HTTP endpoints, applies middleware chain         | Controller          |
| **Middleware**  | Auth, validation, rate limiting, logging                 | Next middleware/ctrl |
| **Controller** | Extracts input from req, calls service, sends response  | Service             |
| **Service**    | Business logic, orchestration, external API calls        | Repository          |
| **Repository** | Data access — ONLY layer that talks to ORM/database     | Database/ORM        |

**Rules:**
- Controllers NEVER contain business logic
- Services NEVER import models directly — they go through repositories
- Repositories NEVER handle HTTP concerns (req/res)
- Each layer only knows about the layer directly below it

---

## Folder Structure

```
ProjectGuider/
├── prisma/                          # Prisma schema (if using Prisma ORM)
│   └── schema.prisma                #   Database schema definition
│
├── src/
│   ├── app.ts                       # Express app factory — middleware registration
│   ├── server.ts                    # Process bootstrap — DB connect, start server, shutdown
│   │
│   ├── config/                      # All configuration in one place
│   │   ├── index.ts                 #   Typed env object (never use process.env directly)
│   │   └── rate-limit.config.ts     #   Rate limiter configuration
│   │
│   ├── common/                      # Shared code used across all modules
│   │   ├── constants/               #   HTTP status codes, response messages
│   │   │   ├── http.constants.ts
│   │   │   └── messages.constants.ts
│   │   ├── helpers/                 #   Utility classes and functions
│   │   │   ├── catch-async.ts       #     Async error wrapper for controllers
│   │   │   └── response/
│   │   │       ├── general-response.ts  # Unified API response builder
│   │   │       └── http-exception.ts    # Custom error classes (404, 401, etc.)
│   │   ├── interfaces/              #   Shared TypeScript interfaces
│   │   │   └── routes.interface.ts  #     Route class contract
│   │   └── validations/             #   Shared Joi validation rules
│   │       └── shared.validation.ts
│   │
│   ├── middlewares/                  # All Express middlewares
│   │   ├── auth.middleware.ts        #   JWT authentication
│   │   ├── check-role.middleware.ts  #   RBAC authorization
│   │   ├── error.middleware.ts       #   Global error handler + 404 handler
│   │   ├── multer.middleware.ts      #   File upload (local or S3)
│   │   ├── query-options.middleware.ts   # Pagination/sorting parser
│   │   ├── request-context.middleware.ts # Async request context
│   │   ├── socket.middleware.ts      #   Socket.IO JWT auth
│   │   └── validation.middleware.ts  #   Joi request validation
│   │
│   ├── modules/                     # Feature modules (one folder per domain)
│   │   ├── auth/                    #   Authentication module
│   │   │   ├── controller/
│   │   │   │   └── auth.controller.ts
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   ├── routes/
│   │   │   │   └── auth.routes.ts
│   │   │   └── validation/
│   │   │       └── auth.validation.ts
│   │   │
│   │   ├── user/                    #   User module (full CRUD example)
│   │   │   ├── controller/
│   │   │   │   └── user.controller.ts
│   │   │   ├── services/
│   │   │   │   └── user.service.ts
│   │   │   ├── repository/
│   │   │   │   └── user.repository.ts
│   │   │   ├── routes/
│   │   │   │   └── user.routes.ts
│   │   │   ├── validation/
│   │   │   │   └── user.validation.ts
│   │   │   └── interfaces/
│   │   │       └── user.interface.ts
│   │   │
│   │   ├── health/                  #   Health check (minimal module)
│   │   │   └── routes/
│   │   │       └── health.routes.ts
│   │   │
│   │   └── common/                  #   Shared module utilities
│   │       ├── base.repository.ts   #     Abstract base CRUD repository
│   │       ├── logger.ts            #     Winston logger
│   │       └── socket/
│   │           ├── socket.manager.ts    # Socket.IO singleton manager
│   │           └── base.gateway.ts      # Abstract Socket.IO gateway
│   │
│   ├── database/                    # Database connections & models (ALL ORMs)
│   │   ├── index.ts                 #   Central connection entry point
│   │   │
│   │   ├── sequelize/               #   === Sequelize (PostgreSQL / MySQL) ===
│   │   │   ├── config.js            #     CLI config (for migrations)
│   │   │   ├── connection.ts        #     Runtime Sequelize instance
│   │   │   ├── models/
│   │   │   │   ├── index.ts         #       Model auto-loader
│   │   │   │   └── user.model.ts    #       Example: User model
│   │   │   ├── migrations/          #     Schema change files
│   │   │   └── seeders/             #     Initial data files
│   │   │
│   │   ├── prisma/                  #   === Prisma (PostgreSQL / MySQL) ===
│   │   │   └── client.ts            #     Prisma client singleton
│   │   │
│   │   └── mongoose/                #   === Mongoose (MongoDB) ===
│   │       ├── connection.ts        #     MongoDB connection
│   │       └── models/
│   │           └── user.model.ts    #       Example: User schema
│   │
│   ├── routes/                      # API router composition
│   │   └── index.ts                 #   Mounts all module routes on /api/v1
│   │
│   ├── utils/                       # General-purpose utilities
│   │   ├── helpers.ts               #   String, object, pagination helpers
│   │   └── email.ts                 #   Email sending utility
│   │
│   ├── types/                       # TypeScript declaration files
│   │   ├── express.d.ts             #   Extends Express Request (authUser, listQuery)
│   │   └── environment.d.ts         #   Types for process.env
│   │
│   ├── scripts/                     # CLI scripts
│   │   └── seed.ts                  #   Database seeder orchestration
│   │
│   ├── docs/                        # API documentation
│   │   └── swagger.setup.ts         #   Swagger/OpenAPI setup
│   │
│   └── test/                        # Test utilities and setup
│       └── .gitkeep
│
├── package.json                     # Dependencies and npm scripts
├── tsconfig.json                    # TypeScript configuration
├── eslint.config.js                 # ESLint flat config
├── .prettierrc                      # Code formatting rules
├── .swcrc                           # SWC transpiler config
├── .sequelizerc                     # Sequelize CLI path config
├── .env.example                     # Environment variable template
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

---

## Data Flow (Request Lifecycle)

Understanding how a request travels through the app is critical:

```
1. Client sends HTTP request
       ↓
2. Express receives it
       ↓
3. Global middleware runs (in order registered in app.ts):
   helmet → hpp → cors → json parser → compression → ...
       ↓
4. Route matching: /api/v1/users → UserRoutes
       ↓
5. Route-level middleware runs (in order specified in route class):
   authMiddleware → validate(schema) → ...
       ↓
6. Controller method executes:
   - Extracts data from req (body, params, query)
   - Calls service method
   - Sends response via generalResponse()
       ↓
7. Service method executes:
   - Contains business logic
   - Calls repository methods
   - Throws HttpException on errors
       ↓
8. Repository method executes:
   - Talks to database via ORM
   - Returns raw data
       ↓
9. Response travels back up the chain
       ↓
10. If error thrown at any point → errorMiddleware catches it
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ (recommended: v20 LTS)
- **npm** or **yarn** or **pnpm**
- A database: **PostgreSQL** or **MySQL** or **MongoDB**

### Setup

```bash
# 1. Navigate to the project
cd ProjectGuider

# 2. Install dependencies
npm install

# 3. Copy environment file and fill in values
cp .env.example .env

# 4. Start development server
npm run dev
```

---

## Choose Your Database / ORM

This boilerplate includes setup files for **three ORM options**. Pick ONE based on your project:

### Option A: Sequelize (PostgreSQL or MySQL)

Best for: Teams familiar with SQL, need fine-grained migration control.

```bash
# Install
npm install sequelize sequelize-typescript pg pg-hstore  # PostgreSQL
npm install sequelize sequelize-typescript mysql2          # MySQL

# In src/database/index.ts, uncomment:
export { connectSequelize as connectDatabase } from './sequelize/connection';

# Run migrations
npm run migrate

# Seed data
npm run seed
```

**Files to work with:**
- `src/database/sequelize/connection.ts` — DB connection
- `src/database/sequelize/models/*.model.ts` — Model definitions
- `src/database/sequelize/migrations/` — Schema changes
- `src/database/sequelize/seeders/` — Initial data
- `.sequelizerc` — CLI config

### Option B: Prisma (PostgreSQL or MySQL)

Best for: Type-safe database access, auto-generated client, visual studio.

```bash
# Install
npm install prisma @prisma/client

# In src/database/index.ts, uncomment:
export { connectPrisma as connectDatabase } from './prisma/client';

# Initialize and migrate
npx prisma migrate dev --name init
npx prisma generate

# Visual database editor
npx prisma studio
```

**Files to work with:**
- `prisma/schema.prisma` — Schema definition (single source of truth)
- `src/database/prisma/client.ts` — Prisma client singleton

### Option C: Mongoose (MongoDB)

Best for: Document-based data, flexible schemas, rapid prototyping.

```bash
# Install
npm install mongoose

# In src/database/index.ts, uncomment:
export { connectMongoose as connectDatabase } from './mongoose/connection';

# Set in .env:
MONGODB_URI=mongodb://localhost:27017/project_guider_db
```

**Files to work with:**
- `src/database/mongoose/connection.ts` — MongoDB connection
- `src/database/mongoose/models/*.model.ts` — Schema definitions

---

## Module Architecture

Every feature is a self-contained module inside `src/modules/`. This is the standard internal structure:

```
modules/
└── [feature-name]/
    ├── controller/          # Thin handlers: req → service → res
    │   └── feature.controller.ts
    ├── services/            # Business logic & orchestration
    │   └── feature.service.ts
    ├── repository/          # Data access (ORM queries)
    │   └── feature.repository.ts
    ├── routes/              # HTTP route definitions + middleware chain
    │   └── feature.routes.ts
    ├── validation/          # Joi schemas for request validation
    │   └── feature.validation.ts
    ├── interfaces/          # (optional) Module-specific TypeScript types
    │   └── feature.interface.ts
    ├── utils/               # (optional) Module-local helpers
    └── socket/              # (optional) Socket.IO gateway
```

**Why modular?** When the app grows to 30+ features, having everything in one `controllers/` folder becomes unmanageable. Modules keep related code together.

---

## Key Concepts for Trainees

### 1. Never Use `process.env` Directly
Always import from `src/config/index.ts`:
```typescript
import { env } from '@/config';
console.log(env.PORT); // typed, validated, with defaults
```

### 2. Always Use `generalResponse()` for API Responses
```typescript
generalResponse({ req, res, data: users, message: 'Users fetched' });
// Returns: { success: true, message: "Users fetched", data: [...] }
```

### 3. Always Use `HttpException` Subclasses for Errors
```typescript
throw new NotFoundException('User not found');     // 404
throw new BadRequestException('Invalid email');     // 400
throw new UnauthorizedException('Token expired');   // 401
// NEVER: throw new Error('something went wrong');
```

### 4. Always Wrap Controllers with `catchAsync()`
```typescript
getAll = catchAsync(async (req, res) => {
  // No try/catch needed! Errors auto-forward to error middleware.
  const users = await this.userService.findAll();
  generalResponse({ req, res, data: users });
});
```

### 5. Routes Are NOT Auto-Discovered
After creating a new route class, you MUST register it in `src/routes/index.ts`:
```typescript
import { UserRoutes } from '../modules/user/routes/user.routes';
const routes: Routes[] = [new UserRoutes()];
```

### 6. Middleware Order Matters
In `app.ts`, middleware runs top-to-bottom. Error handlers MUST be last.
In routes, middleware runs left-to-right:
```typescript
this.router.get('/', authMiddleware, validate(schema), this.controller.getAll);
//                    ↑ runs first    ↑ runs second    ↑ runs last
```

---

## Available Scripts

| Script                | What It Does                                            |
| --------------------- | ------------------------------------------------------- |
| `npm run dev`         | Start dev server with hot reload (tsx watch)            |
| `npm run build`       | Compile TypeScript to JavaScript (SWC + tsc)            |
| `npm run start`       | Run compiled code from dist/ (production)               |
| `npm run typecheck`   | Type-check without emitting files                       |
| `npm run lint`        | Run ESLint on all TypeScript files                      |
| `npm run lint:fix`    | Auto-fix lint issues                                    |
| `npm run format`      | Format all files with Prettier                          |
| `npm run format:check`| Check formatting without changing files                 |
| `npm run check`       | Run typecheck + lint + format:check (full quality gate) |
| `npm run migrate`     | Run Sequelize migrations                                |
| `npm run migrate:undo`| Undo all Sequelize migrations                           |
| `npm run seed`        | Run Sequelize seeders                                   |
| `npm run prisma:generate` | Generate Prisma client                              |
| `npm run prisma:migrate`  | Run Prisma migrations                               |
| `npm run prisma:studio`   | Open Prisma visual editor                            |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values. Key groups:

| Group       | Variables                                                     |
| ----------- | ------------------------------------------------------------- |
| Runtime     | `NODE_ENV`, `PORT`, `SITE_URL`, `LOG_LEVEL`                  |
| Database    | `DATABASE_URL`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` |
| MongoDB     | `MONGODB_URI`                                                 |
| Auth (JWT)  | `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`          |
| File Upload | `FILE_STORAGE_DRIVER`, `MAX_UPLOAD_SIZE_MB`                   |
| AWS S3      | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`    |
| Email       | `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`        |
| Rate Limit  | `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`                      |

---

## Adding a New Module (Step-by-Step)

Example: Adding a **Product** module.

### Step 1: Create the folder structure
```
src/modules/product/
├── controller/product.controller.ts
├── services/product.service.ts
├── repository/product.repository.ts
├── routes/product.routes.ts
├── validation/product.validation.ts
└── interfaces/product.interface.ts
```

### Step 2: Create the database model
- **Sequelize:** `src/database/sequelize/models/product.model.ts`
- **Prisma:** Add model to `prisma/schema.prisma`, run `npx prisma migrate dev`
- **Mongoose:** `src/database/mongoose/models/product.model.ts`

### Step 3: Build from bottom up
1. **Interface** — define the TypeScript types
2. **Repository** — implement data access methods
3. **Service** — implement business logic
4. **Validation** — create Joi schemas
5. **Controller** — create thin handler methods
6. **Routes** — wire everything together with middleware

### Step 4: Register the route
In `src/routes/index.ts`:
```typescript
import { ProductRoutes } from '../modules/product/routes/product.routes';

const routes: Routes[] = [
  new ProductRoutes(),
  // ...other routes
];
```

### Step 5: Test
```bash
npm run dev
curl http://localhost:3000/api/v1/products
```

---

## Common Mistakes to Avoid

| Mistake | Why It's Bad | Do This Instead |
| ------- | ------------ | --------------- |
| Business logic in controllers | Controllers become unmaintainable | Move logic to services |
| Direct model imports in services | Tight coupling, hard to test | Use repository pattern |
| `throw new Error()` | Won't have proper HTTP status code | Use `HttpException` subclasses |
| Forgetting to register routes | Endpoints won't work, no error shown | Always add to `src/routes/index.ts` |
| Using `process.env` directly | No type safety, no validation | Use `env` from `src/config` |
| `console.log` in production | Unstructured, no rotation | Use Winston logger |
| Hardcoding values | Hard to change across environments | Use `.env` + config |
| Skipping validation | Bad data reaches database | Always use Joi + validate middleware |

---

## Tech Stack Summary

| Category       | Technology                                  |
| -------------- | ------------------------------------------- |
| Runtime        | Node.js 18+                                 |
| Framework      | Express 4                                   |
| Language       | TypeScript (strict mode)                    |
| SQL ORM        | Sequelize or Prisma                         |
| NoSQL ODM      | Mongoose                                    |
| Validation     | Joi                                         |
| Auth           | JWT (jsonwebtoken + bcryptjs)               |
| Logging        | Winston + daily-rotate-file                 |
| API Docs       | Swagger / OpenAPI                           |
| Realtime       | Socket.IO                                   |
| Security       | helmet, hpp, cors, express-rate-limit       |
| Build          | SWC (transpile) + tsc (type check)          |
| Dev Server     | tsx (hot reload)                             |
| Linting        | ESLint + @typescript-eslint                 |
| Formatting     | Prettier                                    |

---

> **Tip for trainees:** Open each file and read the description comment at the top.
> Every file in this boilerplate has a detailed explanation of what it does,
> when to use it, and how it connects to other parts of the system.
