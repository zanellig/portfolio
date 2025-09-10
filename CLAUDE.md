# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development

- `pnpm dev` - Start all applications in development mode (web on :3001, server on :3000)
- `pnpm dev:web` - Start only the web application
- `pnpm dev:server` - Start only the server
- `pnpm build` - Build all applications
- `pnpm check-types` - TypeScript type checking across all apps

### Database Operations

- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio database UI
- `pnpm db:generate` - Generate migrations
- `pnpm db:migrate` - Run migrations
- `pnpm db:start` - Start MySQL via Docker Compose
- `pnpm db:stop` - Stop MySQL container
- `pnpm db:down` - Stop and remove MySQL container

## Architecture

This is a TypeScript monorepo using Turborepo with two main applications:

### Apps Structure

- `apps/web/` - Next.js frontend application (port 3001)
- `apps/server/` - Hono backend API with tRPC (port 3000)

### Key Technologies

- **Monorepo**: Turborepo with pnpm workspaces
- **Frontend**: Next.js with TailwindCSS and shadcn/ui
- **Backend**: Hono server with tRPC for type-safe APIs
- **Database**: MySQL with Drizzle ORM
- **Authentication**: Better-Auth with email/password
- **Runtime**: Bun for server, Node.js for web

### Database Architecture

- Uses Drizzle ORM with MySQL
- Schema located in `apps/server/src/db/schema/`
- Separate schemas for auth and blog functionality
- Database connection configured via `DATABASE_URL` environment variable

### API Architecture

- tRPC router in `apps/server/src/routers/index.ts`
- Public and protected procedures
- Type-safe client-server communication
- Authentication middleware for protected routes

### Authentication Flow

- Better-Auth configuration in `apps/server/src/lib/auth.ts`
- Client-side auth in `apps/web/src/lib/auth-client.ts`
- Uses email/password authentication
- Session-based with secure cookies

## Environment Setup

- Server environment: `apps/server/.env` (DATABASE_URL, CORS_ORIGIN)
- Web environment: `apps/web/.env.local` (NEXT_PUBLIC_SERVER_URL)
- MySQL database required for development

## IMPORTANT

- Run ide diagnostics after each file edit if the diagnostics are not returned immediately
- NEVER run build commands (`pnpm build`, `pnpm run build`, etc.) - these are for CI/CD only
