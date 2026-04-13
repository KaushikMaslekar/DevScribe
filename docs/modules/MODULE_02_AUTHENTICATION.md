# Module 02: JWT Authentication and Security

## Goal

Build secure, stateless authentication for backend APIs and frontend sessions.

## Status

Implemented and pushed.

## API Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

## Backend Components

- `User` entity with role and hashed password.
- `UserRepository` for identity lookup.
- Auth DTOs for request/response contracts.
- `AuthService` for business logic.
- `JwtTokenProvider` for token generation and validation.
- `JwtAuthenticationFilter` to resolve bearer/cookie token and populate security context.
- `SecurityConfig` with stateless filter chain and route authorization.
- Global exception handler for validation and status-consistent API errors.

## Frontend Components

- Login and Register pages connected to backend APIs.
- Auth API layer (`auth-api`) and token lifecycle storage.
- Token persistence with secure-cookie preference + localStorage fallback.
- Global 401 behavior: clear token and redirect to login.

## How Login Works End-to-End

1. User submits credentials on frontend.
2. Frontend calls `POST /auth/login`.
3. Backend validates credentials via AuthenticationManager and BCrypt hash match.
4. Backend signs JWT and returns auth payload.
5. Frontend stores token metadata and navigates to dashboard.
6. Subsequent API calls include bearer token automatically through Axios interceptor.

## How Protected Calls Work

1. Request arrives with bearer header or auth cookie.
2. JWT filter validates token and extracts subject (email).
3. User details are loaded from database.
4. SecurityContext is populated for controller/service access control.
5. Protected endpoint executes with authenticated principal.

## Security Model

- Stateless session policy.
- Password hashing with BCrypt.
- JWT expiration enforced.
- Endpoint-level access control in SecurityConfig.

## Failure Handling

- Invalid credentials -> 400 with consistent error payload.
- Missing/invalid token for protected endpoint -> 401.
- Validation failures -> structured field-level response.

## Validation Scope

- Register flow successful.
- Login flow successful.
- Authenticated `GET /auth/me` returns profile.
- Unauthenticated `GET /auth/me` denied.
