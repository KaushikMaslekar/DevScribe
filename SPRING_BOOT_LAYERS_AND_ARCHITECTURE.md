# Spring Boot Layers and Architecture

This document describes the current backend structure for DevScribe and how the main Spring Boot layers fit together.

## 1. High-Level Architecture

DevScribe uses a classic layered Spring Boot backend:

- `controller` layer exposes HTTP endpoints.
- `service` layer contains business rules and transaction boundaries.
- `repository` layer handles database access with Spring Data JPA.
- `entity` layer maps the domain model to PostgreSQL tables.
- `dto` layer shapes request and response payloads.
- `security` layer handles JWT authentication and authorization.
- `exception` layer converts backend errors into consistent API responses.
- `util` layer contains reusable helpers such as slug generation.

The frontend calls the backend through `/api` endpoints, and the backend persists data in PostgreSQL through JPA and Flyway-managed schema migrations.

## 2. Request Flow

Typical request flow:

1. The client sends an HTTP request to a controller.
2. Spring Security authenticates the request when needed.
3. The controller validates the request body and forwards it to a service.
4. The service applies business rules and coordinates repositories.
5. Repositories read or write entities in PostgreSQL.
6. The service maps entities to DTOs and returns the response.
7. The exception layer converts known failures into structured JSON errors.

## 3. Layer Responsibilities

### Controller Layer

Controllers are thin HTTP adapters.

Current examples:

- `AuthController`
- `PostController`
- `TagController`
- `UserController`

Responsibilities:

- Bind request parameters and bodies.
- Validate input with `jakarta.validation`.
- Return HTTP status codes and response DTOs.

### Service Layer

Services contain the real application logic.

Current examples:

- `AuthService`
- `PostService`
- `TagService`
- `UserService`

Responsibilities:

- Enforce business rules.
- Apply transactional boundaries.
- Coordinate repositories and helper utilities.
- Handle authorization decisions that depend on the current user.

### Repository Layer

Repositories are Spring Data JPA interfaces.

Current examples:

- `UserRepository`
- `PostRepository`
- `TagRepository`

Responsibilities:

- Fetch and persist entities.
- Expose query methods for filters and lookups.
- Keep database logic out of controllers and services.

### Entity Layer

Entities represent the persisted domain model.

Current examples:

- `User`
- `Post`
- `Tag`
- `PostStatus`
- `UserRole`

Responsibilities:

- Map directly to PostgreSQL tables.
- Define relationships such as post-author and post-tags.
- Keep persistence concerns close to the data model.

### DTO Layer

DTOs define the API contract.

Current examples:

- `AuthRegisterRequest`
- `AuthLoginRequest`
- `AuthResponse`
- `AuthTokenPayload`
- `UserMeResponse`
- `CreatePostRequest`
- `UpdatePostRequest`
- `UpdatePostTagsRequest`
- `PostSummaryResponse`
- `PostDetailResponse`

Responsibilities:

- Prevent leaking internal entities directly to clients.
- Keep request and response shapes stable.
- Make validation explicit at the API boundary.

### Security Layer

Security is stateless and JWT-based.

Current components:

- `SecurityConfig`
- `JwtAuthenticationFilter`
- `JwtTokenProvider`
- `JwtProperties`
- `CustomUserDetailsService`

Responsibilities:

- Authenticate requests from bearer tokens or HTTP-only cookies.
- Protect write operations.
- Expose the current authenticated user to the service layer.

### Exception Layer

The exception layer turns backend failures into readable JSON.

Current component:

- `GlobalExceptionHandler`

Responsibilities:

- Map validation errors and response status exceptions.
- Keep error payloads consistent for the frontend and Postman.

### Utility Layer

Current example:

- `SlugUtil`

Responsibilities:

- Convert titles and tag names into stable URL-safe slugs.

## 4. Data Model

Current persisted tables include:

- `users`
- `posts`
- `tags`
- `post_tags`
- `view_tracking`

Important relationships:

- One user can author many posts.
- One post belongs to one author.
- One post can have many tags.
- One tag can belong to many posts.

## 5. Backend Modules Implemented So Far

### Module 1

- Spring Boot foundation
- PostgreSQL and Flyway baseline
- Frontend scaffold and API client setup

### Module 2

- JWT authentication
- Register, login, and current-user endpoints
- Spring Security configuration

### Module 3

- Post CRUD
- Publish workflow
- Owner-based authorization

### Module 4

- Tag entity and tag repository
- Tag assignment on posts
- Tag filtering on post lists
- Tag display in frontend views

## 6. Architecture Notes

- Controllers should stay thin and avoid business logic.
- Services should be the main place for rules, validation decisions, and transaction boundaries.
- Repositories should remain focused on persistence only.
- DTOs should be used for all public request and response shapes.
- Security should be stateless to keep the API simple for the frontend and Postman.

## 7. Typical Feature Pattern

When adding a new feature, the usual order is:

1. Add or update entities.
2. Add repository queries.
3. Add service logic.
4. Add controller endpoints.
5. Add or update DTOs.
6. Add frontend API calls and UI.
7. Validate with compile/run checks and Postman.

## 8. Next Modules

The next planned backend/frontend work is:

- Module 5: Rich editor and markdown pipeline
- Module 6: Autosave reliability layer
- Module 7: Realtime synchronization
- Module 8: Collaborative editing
