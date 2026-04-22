# 📚 DevScribe Architecture & Implementation Guide - Updated April 23, 2026

## Quick Reference

### ✅ Recently Implemented (Phase 1)

**Comments System - Full Stack Integration**

```
Backend: Entity → Repository → Service → Controller → DTOs
Frontend: Types → API Client → Components → Page Integration
```

### 📊 Current Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                     │
│  Pages → Components → Hooks → API Client → Types        │
├─────────────────────────────────────────────────────────┤
│                   HTTP API (/api)                        │
├─────────────────────────────────────────────────────────┤
│              Backend (Spring Boot Layered)               │
│                                                          │
│  Controller → Service → Repository → Entity (JPA)       │
│       ↓        ↓          ↓             ↓                │
│     HTTP    Business    Database      Schema            │
│   Routing    Logic      Access       Mapping            │
└─────────────────────────────────────────────────────────┘
       ↓
   PostgreSQL (Flyway Migrations)
```

---

## Implemented Layers & Components

### 1. Controller Layer
Examples implemented:
- `AuthController` - Login, register, token refresh
- `PostController` - CRUD, publish, autosave, timeline, restore
- `TagController` - Tag listing and filtering
- `UserController` - User profile, follow, me endpoint
- `CommentController` ⭐ **NEW** - Comment CRUD, flag, count
  - `GET /posts/{postId}/comments` - Paginated with nested replies
  - `POST /posts/{postId}/comments` - Create (authenticated)
  - `DELETE /posts/{postId}/comments/{commentId}` - Delete (owner/author)
  - `POST /posts/{postId}/comments/{commentId}/flag` - Report

### 2. Service Layer
Examples implemented:
- `AuthService` - JWT generation, validation, user lookup
- `PostService` - Full lifecycle, ownership checks, publishing
- `TagService` - Tag management and assignment
- `UserService` - Profile management, following
- `CommentService` ⭐ **NEW** 
  - Hierarchical comment threading
  - Ownership/authorization enforcement
  - Soft delete with FLAGGED/ACTIVE/DELETED states
  - Thread-aware retrieval with recursive replies

### 3. Repository Layer
Examples implemented:
- `UserRepository` - User lookup, email-based auth
- `PostRepository` - Post queries, slug lookup, status filtering
- `TagRepository` - Tag CRUD and discovery
- `CommentRepository` ⭐ **NEW**
  - `findTopLevelCommentsByPostId()` - Root comments (paginated)
  - `findRepliesByParentCommentId()` - Thread replies
  - `countActiveCommentsByPostId()` - Active count

### 4. Entity Layer
Key entities:
- `User` - Authentication principal
- `Post` - Blog content with status workflow
- `Tag` - Taxonomy
- `PostLike` - Like reactions
- `PostBookmark` - User bookmarks
- `PostAutosaveSnapshot` - Revision history
- `Series` - Post groupings
- `Comment` ⭐ **NEW**
  ```java
  @Entity
  public class Comment {
    Long id;
    Post post;
    User author;
    Comment parentComment; // Self-referential for threading
    String content;
    CommentStatus status; // ACTIVE, FLAGGED, DELETED
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
  }
  ```

### 5. DTO Layer
Request/Response contracts:

**Comment-related DTOs ⭐ NEW:**
```java
record CreateCommentRequest(
  String content,
  Long parentCommentId // nullable
)

record CommentResponse(
  Long id,
  Long postId,
  Long parentCommentId,
  AuthorInfo author,
  String content,
  String status,
  OffsetDateTime createdAt,
  OffsetDateTime updatedAt,
  boolean isAuthor
)

record CommentThreadResponse(
  CommentResponse comment,
  List<CommentThreadResponse> replies // recursive
)

record AuthorInfo(
  Long id,
  String username,
  String displayName,
  String avatarUrl
)
```

### 6. Security Layer
Stateless JWT-based:
- `SecurityConfig` - HTTP security and access rules
- `JwtAuthenticationFilter` - Bearer token extraction
- `JwtTokenProvider` - Token generation/validation
- Comment endpoints: Read public, write authenticated

### 7. Database Layer
**Flyway Migrations:**
- V1-V12: Foundation, auth, posts, tags, series, etc.
- **V13 (NEW)**: Comments schema
  ```sql
  CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT REFERENCES posts(id),
    author_id BIGINT REFERENCES users(id),
    parent_comment_id BIGINT REFERENCES comments(id),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
  );
  ```

---

## Frontend Architecture

### Component Hierarchy (Comments Feature)

```
PostDetailPage
  └── CommentSection
      ├── CommentComposer (root level)
      └── CommentThread (recursive)
          ├── CommentItem
          ├── CommentComposer (nested reply)
          └── CommentThread[] (child replies)
```

### API Integration Pattern

```typescript
// API Client: comment-api.ts
getComments(postId, page) → PageResponse<CommentThreadResponse>
createComment(postId, request) → CommentResponse
deleteComment(postId, commentId) → void
flagComment(postId, commentId) → void

// Hooks: TanStack Query
useQuery(["comments", postId, page])
useMutation(createComment)
useMutation(deleteComment)
useMutation(flagComment)

// Optimistic Updates
queryClient.invalidateQueries(["comments", postId])
```

---

## Typical Feature Implementation Flow

When adding a new feature, follow this pattern:

### 1. Backend (In Order)
```
1. Flyway Migration (SQL schema)
   ↓
2. Entity (JPA mapping)
   ↓
3. Repository (queries)
   ↓
4. Service (business logic)
   ↓
5. Controller (HTTP endpoints)
   ↓
6. DTOs (request/response)
   ↓
7. Security Config updates
   ↓
8. Integration tests
```

### 2. Frontend (In Order)
```
1. Types (interfaces/records)
   ↓
2. API Client (axios calls)
   ↓
3. Component (React)
   ↓
4. Integration (pages)
   ↓
5. Linting & Build
```

---

## Current Implementation Status

### ✅ Phase 1: Comments System (COMPLETE)

**Backend Deliverables:**
- [x] Comment entity with threading
- [x] CommentRepository with hierarchical queries
- [x] CommentService with authorization
- [x] CommentController with REST endpoints
- [x] Security rules (read public, write authenticated)
- [x] Flyway migration V13
- [x] 7+ integration tests (all passing)

**Frontend Deliverables:**
- [x] Comment types and API client
- [x] CommentComposer component
- [x] CommentItem component with actions
- [x] CommentSection with pagination
- [x] Integration on /posts/[slug]
- [x] Relative timestamps
- [x] Error handling & loading states
- [x] Linting clean, build successful

**CI/CD Status:**
- [x] Latest commit: 2/2 checks passing ✅
- [x] All 39 backend tests passing
- [x] Frontend linting clean
- [x] Workflow optimized (Flyway validation removed)

### 🔜 Phase 2: Enhanced Reactions System (NEXT)

**Planned Deliverables:**
- Expand from basic "like" to multi-type reactions
- Reaction types: like, love, celebrate, insightful, etc.
- Aggregate counts and per-user state
- UI with emoji picker
- Optimistic updates on all platforms

---

## Key Design Decisions

### 1. Comment Threading
**Pattern:** Self-referential FK (parent_comment_id)
**Pros:** Simple, flexible depth, database-normalized
**Cons:** N+1 query problem (mitigated with recursive queries)

### 2. Soft Delete
**Pattern:** Status enum (ACTIVE, FLAGGED, DELETED) instead of hard delete
**Pros:** Audit trail, can restore, anonymous deleted comments
**Cons:** Requires status filtering everywhere

### 3. Authorization Model
**Pattern:** Ownership-based (author OR post owner can delete)
**Pros:** Post authors can moderate their own post
**Cons:** Need explicit checks in service layer

### 4. Optimistic Updates (Frontend)
**Pattern:** Update UI immediately, invalidate on success
**Pros:** Feels instant and responsive
**Cons:** Need rollback on error

---

## Testing Strategy

### Backend
- **Unit Tests**: Service layer with mocks
- **Integration Tests**: Full stack with H2 in-memory DB
- **Security Tests**: Authorization and authentication rules

### Frontend
- **Linting**: ESLint with Next.js rules
- **Build**: Next.js TypeScript compilation
- **Manual E2E**: Playwright tests (in `/e2e`)

### CI/CD
- **Automated**: GitHub Actions on every push
- **Backend**: Tests → Compile
- **Frontend**: Lint → Build
- **Status**: Latest commit shows 2/2 ✅

---

## Database Schema (Updated)

```
users
├── id (PK)
├── email (UNIQUE)
├── username (UNIQUE)
├── password_hash
├── display_name
├── avatar_url

posts
├── id (PK)
├── author_id (FK → users)
├── title
├── slug (UNIQUE)
├── content (markdown)
├── status (DRAFT, PUBLISHED, SCHEDULED, ARCHIVED)
├── published_at
├── created_at

comments ⭐ NEW
├── id (PK)
├── post_id (FK → posts)
├── author_id (FK → users)
├── parent_comment_id (FK → comments, self-ref, nullable)
├── content
├── status (ACTIVE, FLAGGED, DELETED)
├── created_at
├── updated_at

tags
├── id (PK)
├── name (UNIQUE)

post_tags
├── post_id (FK)
├── tag_id (FK)

[other tables: bookmarks, likes, series, etc.]
```

---

## Deployment Checklist for New Features

Before marking a feature complete:

- [ ] **Backend**
  - [ ] Entity created
  - [ ] Migration written (Flyway)
  - [ ] Repository queries tested
  - [ ] Service logic with proper auth
  - [ ] Controller endpoints defined
  - [ ] DTOs match API contract
  - [ ] Security rules applied
  - [ ] Integration tests (>=5 tests)
  - [ ] Local compile/test pass

- [ ] **Frontend**
  - [ ] Types defined (TypeScript)
  - [ ] API client implemented
  - [ ] Components built
  - [ ] Integrated into pages
  - [ ] Linting clean (npm run lint)
  - [ ] Build successful (npm run build)
  - [ ] Tested manually

- [ ] **Documentation**
  - [ ] Architecture doc updated
  - [ ] Implementation report created
  - [ ] REMAINING_FEATURES.md synced
  - [ ] Commit message clear

- [ ] **CI/CD**
  - [ ] Latest commit shows 2/2 ✅
  - [ ] All tests passing locally
  - [ ] No linting warnings

---

## Quick Navigation

| Document | Purpose |
|----------|---------|
| `SPRING_BOOT_LAYERS_AND_ARCHITECTURE.md` | Architecture overview (THIS FILE) |
| `REMAINING_FEATURES.md` | Feature roadmap & status |
| `docs/DEVSCRIBE_DEEP_DIVE.md` | Detailed architectural decisions |
| `docs/implementation-reports/` | Per-commit implementation details |
| `docs/modules/` | Module-level documentation |

---

**Last Updated:** April 23, 2026  
**Current Phase:** Phase 1 Complete, Ready for Phase 2  
**Status:** ✅ All Systems Go

