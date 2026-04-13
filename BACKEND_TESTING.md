# DevScribe Backend Testing Guide

This guide helps you test the current backend features in Postman (Auth + Posts).

## 1. Prerequisites

- Java 21+
- PostgreSQL running on `localhost:5432`
- Database `devscribe` created
- Backend dependencies installed by Maven

Optional (quick local setup):

```powershell
docker compose up -d
```

## 2. Start the Backend

From repository root:

```powershell
mvnw.cmd spring-boot:run
```

Backend base URL:

- `http://localhost:8080/api`

## 3. Postman Setup

Create a Postman environment with:

- `baseUrl` = `http://localhost:8080/api`
- `accessToken` = (leave empty initially)

Use this header for authenticated requests:

- `Authorization: Bearer {{accessToken}}`

Note:

- Login/Register also set an HTTP-only auth cookie.
- Bearer token is still useful for explicit Postman testing.

## 4. Test Authentication Endpoints

### 4.1 Register

- Method: `POST`
- URL: `{{baseUrl}}/auth/register`
- Header: `Content-Type: application/json`
- Body:

```json
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "password123"
}
```

Expected:

- `200 OK`
- JSON contains:
  - `accessToken`
  - `tokenType` (Bearer)
  - `expiresInMs`
  - `user`

Save token from response into environment variable `accessToken`.

### 4.2 Login

- Method: `POST`
- URL: `{{baseUrl}}/auth/login`
- Header: `Content-Type: application/json`
- Body:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Expected:

- `200 OK`
- Token + user returned

Update `accessToken` with returned token.

### 4.3 Me

- Method: `GET`
- URL: `{{baseUrl}}/auth/me`
- Header: `Authorization: Bearer {{accessToken}}`

Expected:

- `200 OK`
- Current user profile data

## 5. Test Post Endpoints (Module 3)

## 5.1 Create Draft Post

- Method: `POST`
- URL: `{{baseUrl}}/posts`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{accessToken}}`
- Body:

```json
{
  "title": "My First DevScribe Post",
  "excerpt": "A quick intro post",
  "markdownContent": "# Hello DevScribe\n\nThis is my first draft post."
}
```

Expected:

- `200 OK`
- Response includes `id`, `slug`, `status` = `DRAFT`

Save `id` as `postId` and `slug` as `postSlug` in Postman environment.

## 5.2 List My Posts

- Method: `GET`
- URL: `{{baseUrl}}/posts?mine=true&page=0&size=10`
- Header: `Authorization: Bearer {{accessToken}}`

Expected:

- `200 OK`
- Page response with your draft/published posts

## 5.3 Update Draft Post

- Method: `PUT`
- URL: `{{baseUrl}}/posts/{{postId}}`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{accessToken}}`
- Body:

```json
{
  "title": "My First DevScribe Post Updated",
  "excerpt": "Updated excerpt",
  "markdownContent": "# Updated Title\n\nUpdated markdown body."
}
```

Expected:

- `200 OK`
- Updated post payload returned

## 5.4 Publish Post

- Method: `POST`
- URL: `{{baseUrl}}/posts/{{postId}}/publish`
- Header: `Authorization: Bearer {{accessToken}}`

Expected:

- `200 OK`
- `status` becomes `PUBLISHED`
- `publishedAt` is populated

## 5.5 List Public Published Posts

- Method: `GET`
- URL: `{{baseUrl}}/posts?page=0&size=10`

Expected:

- `200 OK`
- Only published posts

## 5.6 Get Post by Slug (Public)

- Method: `GET`
- URL: `{{baseUrl}}/posts/{{postSlug}}`

Expected:

- `200 OK` for published post
- Returns full post detail payload

## 5.7 Delete Post

- Method: `DELETE`
- URL: `{{baseUrl}}/posts/{{postId}}`
- Header: `Authorization: Bearer {{accessToken}}`

Expected:

- `204 No Content`

## 6. Quick Negative Tests

- `GET /auth/me` without token -> `401`
- `POST /posts` without token -> `401`
- `GET /posts/{slug}` for non-published/non-existing slug -> `404`
- Duplicate register email/username -> `400`

## 7. Troubleshooting

- If startup fails with DB errors:
  - Verify PostgreSQL is running.
  - Verify credentials in `application.properties` or env vars.
- If you get `401` in Postman:
  - Ensure `accessToken` is set and Authorization header is present.
  - Re-login and refresh token value.
- If Flyway migration fails:
  - Check if schema already has conflicting structure.
  - Use a clean local DB for first run.

## 8. Next

After this passes, backend is ready for Module 4 testing (tags and filtering).
