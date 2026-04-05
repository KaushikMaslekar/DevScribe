# DevScribe

DevScribe is a production-grade, developer-focused blogging platform.

## Monorepo Layout

- `frontend/`: Next.js 16, React 19, TypeScript strict, Tailwind, shadcn/ui primitives
- `src/`: Spring Boot backend source (root module: `devscribe-api`)
- `docker-compose.yml`: Local PostgreSQL and Redis services

## Module Delivery Strategy

This repository is implemented module-by-module. Each module is committed and pushed independently.

### Module 1 (Current)

- Backend foundation with Spring Boot + PostgreSQL + Flyway baseline
- Initial SQL migration for core entities
- Frontend foundation with App Router and required core dependencies
- Axios client with auth/error interceptors
- TanStack Query provider setup
- Middleware-based protected route baseline

### Module 2 (Current)

- JWT authentication implemented end-to-end
- Backend auth endpoints: register, login, me
- Stateless Spring Security filter chain with JWT validation
- BCrypt password hashing and user persistence
- Frontend login/register pages connected to backend APIs
- Token lifecycle handling with secure-cookie preference and localStorage fallback

### Upcoming Modules

- Module 3: Post CRUD, draft/publish flow, dashboard integration
- Module 4: Tagging and filtering
- Module 5: TipTap editor and markdown workflow
- Module 6: Fault-tolerant autosave system
- Module 7: Realtime updates (Supabase)
- Module 8: Collaborative editing (TipTap + Y.js + Hocuspocus)
- Module 9: Search (SQL first, Elasticsearch optional)
- Module 10+: hardening, observability, performance, and production readiness

## Run Locally

### Backend

1. Start local services:
   - `docker compose up -d`
2. Run the API:
   - `./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`)

Backend base URL: `http://localhost:8080/api`

### Frontend

1. Go to frontend app:
   - `cd frontend`
2. Install dependencies:
   - `npm install`
3. Run dev server:
   - `npm run dev`

Frontend URL: `http://localhost:3000`
