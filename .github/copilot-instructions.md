# HeritageAtlas - AI Agent Instructions

## Architecture Overview

This is a portfolio full-stack app for tracking UNESCO World Heritage site visits. Key separation:
- **Backend** (`/backend`): Express + MongoDB — stores only `UserProgress` (user journey data)
- **Frontend** (`/frontend`): React + Vite + Tailwind + Leaflet — owns the static UNESCO dataset

**Critical**: The UNESCO sites dataset lives in `frontend/src/data/unesco.js` and is never sent to the backend. Backend only knows about user progress records.

## Module System (Strict)

**ES Modules only** — no CommonJS anywhere:
```javascript
// ✅ Correct
import express from "express";
export async function handler(req, res) { }

// ❌ Never use
const express = require("express");
module.exports = handler;
```

Both `package.json` files contain `"type": "module"`.

## Code Style Conventions

1. **Named function declarations** over arrow functions:
   ```javascript
   // ✅ Preferred
   export async function getProgress(req, res) { }
   
   // ❌ Avoid
   export const getProgress = async (req, res) => { }
   ```

2. **Backend pattern**: `routes → controllers → models → config`
3. **Async/await only** — no callbacks or raw promises
4. **Try/catch in controllers** with proper HTTP status codes

## Anonymous Identity System

Users are identified by a UUID stored in localStorage, not authentication:
- Frontend generates UUID via `crypto.randomUUID()` in `frontend/src/utils/uuid.js`
- Axios interceptor attaches it as `anonymous-id` header (see `frontend/src/services/api.js`)
- Backend middleware (`backend/middleware/anonymous.middleware.js`) extracts it to `req.userId`

## UserProgress Schema

Located in `backend/models/UserProgress.js`. Key rules:
- Compound unique index: `(userId, placeId)`
- Rating: 1–5 (optional)
- Notes: max 500 chars
- **Empty record deletion**: If all optional fields are empty/false, delete the record entirely (see `createOrUpdateProgress` controller)

## Frontend Patterns

- **Tailwind only** — no CSS files or inline styles
- **React Router** for navigation (`/`, `/place/:id`, `/my-journey`)
- **No Redux or Context** — use local state and props

### Leaflet Map Configuration

The map in `frontend/src/pages/MapPage.jsx` uses specific settings to prevent world duplication:
```javascript
L.map("map", {
  maxBounds: L.latLngBounds([-85, -180], [85, 180]),
  maxBoundsViscosity: 1.0,
  worldCopyJump: false,
  minZoom: 2,
  maxZoom: 8,
})
// TileLayer must also have noWrap: true
```

## Environment Variables

```bash
# Backend (.env)
PORT=5000
MONGO_URI=mongodb://localhost:27017/heritage-atlas

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:5000
```

## Key Commands

```bash
# Backend (from /backend)
npm run dev          # Start with nodemon

# Frontend (from /frontend)
npm run dev          # Vite dev server
npm run build        # Production build
```

## What NOT to Do

- ❌ Add TypeScript
- ❌ Add Redux or state management libraries
- ❌ Add authentication
- ❌ Store UNESCO data in backend
- ❌ Use arrow functions for top-level exports
- ❌ Overengineer with extra abstraction layers
