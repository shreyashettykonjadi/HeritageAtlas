# Backend Design — HeritageAtlas

## 1. Overview

HeritageAtlas backend is a lightweight REST API responsible exclusively for persisting user interaction data.

It deliberately does **not**:

* Store UNESCO dataset information
* Implement authentication or sessions
* Introduce complex service layers
* Over-abstract simple logic

The backend stores only user progress state.

This intentional minimalism keeps the system:

* Simple
* Predictable
* Scalable
* Easy to maintain
* Clear during portfolio evaluation

---

## 2. Tech Stack

* Node.js (ES Modules)
* Express
* MongoDB
* Mongoose
* No TypeScript
* No authentication layer

**Design principle:** clarity over abstraction.

---

## 3. System Architecture

```
Client (React + Static UNESCO Data + UUID)
        ↓
anonymous-id header
        ↓
Identity Middleware
        ↓
Controllers
        ↓
Mongoose Model
        ↓
MongoDB
```

### Layer Responsibilities

**Middleware**

* Validates `anonymous-id`
* Attaches `req.userId`

**Controllers**

* Implement business logic
* Handle partial update merging
* Apply deletion rules
* Return appropriate HTTP responses

**Model**

* Defines schema
* Enforces validation
* Defines compound unique index

**Database**

* Persists user progress documents

Each layer has a single responsibility.

---

## 4. Identity System

HeritageAtlas uses an anonymous identity model.

### Flow

1. Frontend generates a UUID.
2. UUID is stored in `localStorage`.
3. UUID is sent in every request via `anonymous-id` header.
4. Middleware validates the header.
5. Middleware attaches `req.userId`.
6. Controllers rely only on `req.userId`.

### Design Rationale

* Removes authentication complexity.
* Keeps onboarding frictionless.
* Maintains clean controller logic.
* Allows future upgrade to JWT or user accounts by modifying middleware only.

Controllers remain untouched if authentication is introduced later.

---

## 5. Data Model

### UserProgress Schema

* `userId` (String, required)
* `placeId` (String, required)
* `visited` (Boolean)
* `bucket` (Boolean)
* `rating` (Number, 1–5)
* `notes` (String, max 500 characters)
* `visitDate` (Date)
* `timestamps` enabled

### Compound Unique Index

```
{ userId: 1, placeId: 1 }
```

This guarantees:

* One record per user per place
* No duplicate progress entries
* Safe upsert operations

---

## 6. Update Strategy

`POST /progress` behaves like a PATCH.

### Rules

* Unsent fields are preserved.
* `visitDate` automatically sets `visited = true`.
* Explicit unsetting is allowed.
* If all optional fields are empty, the document is deleted.
* Uses `findOneAndUpdate` with `upsert`.
* `runValidators` is enabled.

This prevents unintended overwrites and ensures data consistency.

---

## 7. Rate Limiting

A global rate limiter is applied at the Express level.

Purpose:

* Prevent excessive automated requests
* Reduce basic denial-of-service risk
* Maintain stability during deployment

The implementation is intentionally lightweight and does not introduce unnecessary infrastructure (no Redis, no clustering).

---

## 8. Engineering Principles

* Single responsibility per layer
* Middleware-driven identity abstraction
* Explicit business logic
* Minimal abstraction
* No overengineering
* Clean separation of concerns

---
