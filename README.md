# KaamLink – MERN Monorepo

KaamLink is a MERN-based platform connecting verified daily-wage workers (maids, drivers, plumbers, electricians, etc.) with households and small businesses across India. This repo is structured as a simple monorepo with a `server` (Node/Express) and `client` (React/Vite) app.

---

## Getting Started

### 1. Install dependencies

You need to install dependencies **in both the server and client folders**:

```bash
# From the project root
cd server
npm install

cd ../client
npm install
```

### 2. Environment variables

You must create `.env` files for both the **server** and **client**. The most important variables to get the project running are:

#### Server `.env`

Create `server/.env` with at least:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/kaamlink_db   # or your MongoDB connection string
JWT_SECRET=replace_with_a_secure_random_string    # used to sign JWT tokens
PORT=5001                                         # or any free port you prefer
```

> You can add other optional variables (like `NODE_ENV`, `JWT_EXPIRES_IN`, `CLIENT_URL`) as needed, but the three above are the minimum required to boot the API.

#### Client `.env`

Create `client/.env` with your API base URL (matching the server `PORT` you chose):

```bash
VITE_API_BASE_URL=http://localhost:5001/api/v1
```

---

## Running the apps

In one terminal, start the backend:

```bash
cd server
npm run dev
```

In another terminal, start the frontend:

```bash
cd client
npm run dev
```

Then open the frontend in your browser (by default):

- Frontend: `http://localhost:5173`
- API health check: `http://localhost:5001/api/v1/health`

