# HeritageAtlas

HeritageAtlas is a full-stack web application for discovering and tracking UNESCO World Heritage Sites across the world.

Users can explore more than 1,200 heritage sites through an interactive map, search for sites, view detailed information and image galleries, and maintain a personalized travel journey by marking destinations as visited or adding them to a bucket list.

The application is built using React.js, Node.js, Express.js, MongoDB, and Redis, with secure JWT-based authentication using HTTP-only cookies.

---

## Screenshots

### Explore Heritage Sites

Browse UNESCO World Heritage Sites across the world using an interactive map. Sites are categorized as Cultural, Natural, or Mixed.

<img width="1606" height="775" alt="image" src="https://github.com/user-attachments/assets/846fee82-3355-4069-bb54-bf1064498a02" />


### Heritage Site Preview

Selecting a marker opens a site preview containing its image, location, category, description, and a link to the complete site page.

<img width="1627" height="780" alt="image" src="https://github.com/user-attachments/assets/6a974e9a-2b47-46e8-b554-74e098d87f3c" />


### Site Details

Each heritage site has a dedicated page containing detailed information and an image gallery.

<img width="1142" height="771" alt="image" src="https://github.com/user-attachments/assets/9c924df2-8e82-46bf-a90c-d17effb1716a" />

<img width="1032" height="782" alt="image" src="https://github.com/user-attachments/assets/76ffa1c4-521a-424c-bbc3-bb18a0c3cb2a" />

<img width="1082" height="772" alt="image" src="https://github.com/user-attachments/assets/ec85e07f-517a-40f5-b27e-5a4cbc14ad8f" />




### My Journey

Authenticated users can maintain their visited sites and bucket-list destinations through a personalized journey dashboard.

<img width="1317" height="762" alt="image" src="https://github.com/user-attachments/assets/ebff5344-815d-4890-a34e-23558f2c5e0a" />


---

## Features

- Interactive map with 1,200+ UNESCO World Heritage Sites
- Cultural, Natural, and Mixed site categorization
- Heritage-site search
- Interactive site previews
- Detailed site information and image galleries
- Secure user registration and login
- JWT authentication using HTTP-only cookies
- Visited-site tracking
- Personal bucket lists
- Ratings, visit dates, and travel notes
- Personalized journey dashboard
- User-specific journey map
- Redis caching for frequently accessed site data
- Protected backend routes
- Persistent user data using MongoDB

---

## Frontend

The frontend is built using React.js and provides an interactive interface for discovering and managing heritage sites.

The major frontend sections include:

**Home / Explore:** Displays heritage sites on an interactive world map using category-based markers.

**Search:** Allows users to search for heritage sites and quickly navigate to their details.

**Site Preview:** Displays a compact preview when a heritage-site marker is selected.

**Site Details:** Provides the site's description, category, country, heritage information, and image gallery.

**My Journey:** Displays all sites the authenticated user has marked as visited or added to their bucket list.

**Journey Management:** Allows users to record ratings, visit dates, and personal notes for visited sites.

**Authentication:** Provides signup, login, logout, and authenticated user functionality.

---

## Backend

The backend is implemented using Node.js and Express.js and exposes REST APIs consumed by the React frontend.

It handles:

- User registration and authentication
- JWT generation and verification
- Heritage-site retrieval
- Heritage-site search
- Map-specific data retrieval
- Visited and bucket-list management
- Ratings, visit dates, and notes
- User-specific data authorization
- Redis caching for read-heavy heritage-site endpoints

Authentication tokens are stored in HTTP-only cookies, preventing client-side JavaScript from directly accessing the JWT.

---

## Database

HeritageAtlas uses MongoDB with Mongoose for data modeling and persistence.

The primary collections include:

### Users

Stores user account and authentication information.

### Heritage Sites

Stores heritage-site information including:

- Name and slug
- Country
- Category
- Geographic coordinates
- Description
- Heritage metadata
- Image information

### User Progress

Stores the relationship between a user and a heritage site along with the user's journey information.

```javascript
{
  user,
  site,
  status,       // visited | bucket
  rating,
  notes,
  visitDate
}
```

Heritage-site data and user progress are stored separately, allowing multiple users to reference the same site without duplicating heritage-site information.

A compound unique index on the user and site prevents duplicate progress records for the same heritage site.

---

## Redis Caching

Redis is used to cache frequently requested heritage-site data and reduce repeated MongoDB queries.

Read-heavy endpoints such as the map and individual site retrieval use a cache-aside strategy.

When data is requested:

1. The backend checks Redis for the corresponding cache key.
2. If the data exists, the cached response is returned.
3. On a cache miss, the backend retrieves the data from MongoDB.
4. The result is stored in Redis with a TTL before being returned.

Example cache keys:

```text
sites:map
site:taj-mahal
site:group-of-monuments-at-hampi
```

Cached entries use TTL-based expiration to prevent stale data from remaining indefinitely.

User-specific journey data is kept outside this cache because it changes more frequently than heritage-site information.

---

## API Design

The HeritageAtlas backend follows the REST architectural style using Node.js and Express.js.

JSON is used for communication between the frontend and backend, with standard HTTP methods for resource operations.

### Authentication

```http
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
```

### Heritage Sites

```http
GET /api/sites/map
GET /api/sites/:slug
```

### User Journey

```http
GET  /api/progress
GET  /api/progress/:slug
POST /api/progress
```

Protected endpoints use authentication middleware to verify the JWT and identify the authenticated user before allowing access to user-specific resources.

---

## Performance Optimization

### Redis Cache

Frequently accessed heritage-site responses are cached in Redis to avoid repeatedly querying MongoDB for largely static data.

### Lightweight Map Endpoint

The map endpoint returns only the fields required to display heritage-site markers instead of retrieving complete site documents.

Example:

```javascript
{
  slug,
  name,
  country,
  category,
  location
}
```

Detailed descriptions, images, and additional metadata are retrieved only when a user opens an individual heritage site.

### MongoDB Indexing

Indexes are used for frequently queried fields and user-progress lookups.

The user-progress collection uses a compound unique index to efficiently retrieve a user's relationship with a site while preventing duplicate entries.

---

## Tech Stack

### Frontend

- React.js
- JavaScript
- Leaflet
- HTML
- CSS

### Backend

- Node.js
- Express.js
- REST APIs

### Database

- MongoDB
- Mongoose

### Caching

- Redis
- Cache-aside pattern
- TTL-based expiration

### Authentication

- JSON Web Tokens (JWT)
- HTTP-only Cookies
- bcrypt

---

## Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd HeritageAtlas
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## Configuration

Create a `.env` file inside the backend directory:

```env
PORT=5000
MONGODB_URI=<your-mongodb-connection-url>
JWT_SECRET=<your-jwt-secret>
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:5173
```

If the frontend uses an environment variable for the backend URL, create a `.env` file inside the frontend directory:

```env
VITE_API_URL=http://localhost:5000
```

Do not commit `.env` files or credentials to the repository.

---

## Running Redis Locally

If Redis is running through Docker:

```bash
docker run -d \
  --name heritage-redis \
  -p 6379:6379 \
  redis:7-alpine
```

Verify that the container is running:

```bash
docker ps
```

---

## Folder Structure

```text
HeritageAtlas/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── assets/
│   ├── .env
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── redis.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   └── package.json
│
├── screenshots/
│   ├── map.png
│   ├── site-preview.png
│   ├── site-details.png
│   └── my-journey.png
│
└── README.md
```

---

## Usage

Start Redis:

```bash
docker start heritage-redis
```

Start the backend:

```bash
cd backend
npm run dev
```

Open another terminal and start the frontend:

```bash
cd frontend
npm run dev
```

Open the application using the local URL provided by the frontend development server.

Users can then:

1. Create an account or log in.
2. Explore heritage sites through the interactive map.
3. Search for a heritage site.
4. Select a map marker to preview the site.
5. Open the site page to view detailed information and images.
6. Mark the site as visited or add it to the bucket list.
7. Add a rating, visit date, and personal notes.
8. View saved sites through My Journey.

---

## Security

HeritageAtlas implements authentication and data-protection measures including:

- Password hashing before database storage
- JWT-based authentication
- JWT storage using HTTP-only cookies
- Authentication middleware for protected routes
- User-specific authorization for journey data
- Environment variables for credentials and secrets

---

## Future Improvements

- Personalized heritage-site recommendations
- Advanced search and filtering
- Map marker clustering
- Image optimization and CDN integration
- Journey statistics and travel analytics

---

## License

This project was developed for educational and portfolio purposes.
