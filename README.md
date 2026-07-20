# DACBY Assignment

A full-stack order dashboard built with:

- React + Vite frontend in `client/`
- Express + MongoDB backend in `server/`
- Scheduler automation for moving orders through statuses

## Project Structure

```txt
.
├── client/                 # React dashboard
├── server/                 # Express API
├── docs/                   # Project documentation
├── render.yaml             # Render backend deployment config
└── DACBY_Assignment.postman_collection.json
```

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB Atlas connection string or local MongoDB URI

## Backend Setup

Go to the server folder:

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=4001
API_VERSION=v1
MONGODB_URI=<your MongoDB connection string>
SCHEDULER_SECRET=<your scheduler secret>
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

Start the backend:

```bash
npm run dev
```

Backend health check:

```txt
http://localhost:4001/health
```

Expected response:

```json
{
  "status": true,
  "message": "Server is healthy"
}
```

## Frontend Setup

Go to the client folder:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_BASE_URL=/api/v1
VITE_API_PROXY_TARGET=http://localhost:4001
```

Start the frontend:

```bash
npm run dev
```

Frontend URL:

```txt
http://localhost:5173
```

## Local Development Flow

Run both apps in separate terminals:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

The Vite dev server proxies local `/api` requests to:

```txt
http://localhost:4001
```

## Main Features

- Orders dashboard
- Status dropdown filter
- Orders table
- Loading, empty, and error states
- Manual refresh and auto-refresh
- Scheduler logs dashboard
- Scheduler run button
- Sidebar navigation between Orders and Scheduler

## API Base URL

Local API base URL:

```txt
http://localhost:4001/api/v1
```

Frontend local env uses:

```env
VITE_API_BASE_URL=/api/v1
```

Production frontend env should use the deployed Render URL:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com/api/v1
```

## Deployment

Backend deployment config:

```txt
render.yaml
```

Frontend deployment config:

```txt
client/vercel.json
```

For Vercel, set root directory to:

```txt
client
```

For Render, use the Blueprint flow from the root `render.yaml`.

## Postman Collection

Import this file into Postman:

```txt
DACBY_Assignment.postman_collection.json
```

Then set collection variables:

```txt
serverBaseUrl = http://localhost:4001
apiBaseUrl = http://localhost:4001/api/v1
schedulerSecret = your scheduler secret
```

## Documentation

- [API Documentation](./docs/api/README.md)
- [Scheduler Documentation](./docs/scheduler/README.md)

