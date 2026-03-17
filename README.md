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

You must create `.env` files for both the **server** and **client**. The project requires MongoDB Atlas to run securely and consistently with the latest features.

#### Server `.env`

Create `server/.env` with the following variables:

```bash
# 1. MongoDB Setup (REQUIRED)
# Create a free cluster at https://www.mongodb.com/cloud/atlas
# Go to Database -> Connect -> Drivers and copy the connection string.
# Replace <db_password> with your database user password.
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/kaamlink_db?retryWrites=true&w=majority

# 2. Authentication (REQUIRED)
# Generate a secure random string for signing JWT tokens.
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# 3. Server Configuration (REQUIRED)
PORT=5001
NODE_ENV=development

# 4. CORS Setup
# Set this to your frontend URL (default Vite is http://localhost:5173)
CLIENT_URL=http://localhost:5173
```

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

## Core Features
* **Dual Roles**: User can sign up as an Employer or Worker.
* **Worker Profiles**: Workers can set their skills, availability, and wage.
* **Booking System**: Employers can book workers and track job statuses.
* **Trust & Safety**: SOS Alerts and built-in reviews framework.
