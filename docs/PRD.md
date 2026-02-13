1) Product Overview

Product Name: HeritageAtlas
Type: Portfolio-Grade Full-Stack Web Application
Core Identity: Personalized Heritage Tracking Platform

HeritageAtlas is an interactive platform that allows users to explore UNESCO World Heritage Sites and track their personal heritage journey through visited and bucket list features.

The map enables discovery.
The tracking system creates product value.

This is not a UNESCO clone or static data viewer.
It is a user-centered travel companion.

2) Product Vision

Transform static UNESCO data into a personalized, interactive tracking experience.

Instead of asking:

“What heritage sites exist?”

The product enables users to ask:

“Which heritage sites have I visited, and what should I explore next?”

The focus is on:

Personal memory

Visual exploration

Persistent progress tracking

Clean and simple interaction

3) Target User

Primary Users:

Travel enthusiasts

History lovers

Curious learners

Recruiters reviewing the portfolio

The experience must feel:

Interactive

Clean

Fast

Personal

4) Core Value Proposition

HeritageAtlas adds a personalization layer on top of global heritage data.

Unlike informational platforms that are static and government-style, this app:

Tracks user activity

Persists progress

Allows users to build a bucket list

Makes exploration interactive

It is a product, not a dataset.

5) MVP Feature Scope (Strict)

Only the following features are included in MVP.

1. Interactive World Map (Foundation)

Full-screen Leaflet map

Load UNESCO heritage sites from a GeoJSON dataset

Render dynamic markers

Global default view

The map is the exploration layer.

2. Site Detail Panel

When a marker is clicked:

Display in a modal or side panel (no page navigation):

Site name

Country

Category (Cultural / Natural)

Year recognized

Image

Short description

“Mark as Visited” button

“Add to Bucket List” button

The map must remain visible in the background.

3. Personalization Layer (Core Differentiator)

Users must be able to:

Mark a site as Visited

Add a site to Bucket List

Toggle these states

See immediate UI updates

Retain this data after refresh

Persistence is handled via MongoDB.

No authentication system.

4. Tracker Signals (Lightweight Product Layer)

Display simple counters:

Total Visited Sites

Total Bucket List Sites

These counters must update dynamically.

No analytics. No charts.

5. Search

Allow filtering by:

Site name

Country

Requirements:

Case-insensitive

Contains-based matching

Real-time filtering

No advanced search logic

6. Simple Filter

Implement only one of the following:

Category filter (Cultural / Natural)
OR

Country dropdown filter

No complex multi-filter systems.

6) Functional Requirements
FR-1: Map Rendering

Map loads on application start

Markers render dynamically from dataset

No page reload required

FR-2: Marker Interaction

Clicking marker opens detail panel

Closing panel returns focus to map

No route changes

FR-3: State Persistence

Visiting or bucket toggling triggers API call

Data stored in MongoDB

State restored on page refresh

FR-4: UI Feedback

Buttons reflect current state (active/inactive)

Counters update immediately

Clear visual distinction between visited and bucketed sites

FR-5: Search & Filter Behavior

Filtering updates visible markers

No backend call required for search/filter

Filtering affects map markers in real time

7) Non-Functional Requirements
Code Quality

Clear folder structure

Small, readable components

No unnecessary abstractions

No advanced state management libraries

Performance

Map loads within 3 seconds

UI interactions feel immediate

No blocking operations

UX Principles

Map-first design

Minimal layout

Clear interaction feedback

No clutter

8) Out of Scope (Non-Goals)

The following are intentionally excluded:

User authentication

Multiple user accounts

Admin dashboard

Complex analytics

Real-time updates

Advanced caching

Pagination

Recommendation system

Deep historical data expansion

Simplicity is intentional.

9) High-Level Architecture

Frontend:

React (JavaScript)

Leaflet

Tailwind CSS

Backend:

Node.js

Express

MongoDB Atlas

Mongoose

Deployment:

Frontend → Vercel

Backend → Render

10) Data Model (Conceptual)
Heritage Place (Read-Only Dataset)

id

name

country

category

year

description

image

coordinates

User Activity (Persistent Layer)

placeId

visited (boolean)

bucket (boolean)

No userId field (single-user MVP assumption).

11) MVP Success Criteria

The project is successful if:

✔ Map renders correctly
✔ Markers load dynamically
✔ Clicking marker shows detailed panel
✔ Users can mark visited
✔ Users can add to bucket list
✔ Data persists after refresh
✔ Tracker counters update correctly
✔ Codebase remains clean and beginner-friendly