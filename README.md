# Edubits

A full-stack student productivity app built with React, Express, and MongoDB.

## Features
- **Task Tracker** — Kanban board with search, filters, priority, deadlines (backed by MongoDB)
- **SGPA + CGPA Calculator** — Semester-wise GPA calculator with PDF export
- **Internal Marks Calculator** — Theory, Practical, and Hybrid subject mark calculators

## Project Structure
```
edubits/
├── backend/          # Express + MongoDB API
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── server.js
└── frontend/         # React + Vite
    └── src/
        ├── app/          # App entry, routing
        ├── components/   # Shared UI components (Navbar, Button, etc.)
        ├── context/      # AuthContext, ToastContext
        ├── features/     # Feature modules (tasks, sgpa, internalMarks, cgpa)
        ├── hooks/        # useTasks
        ├── pages/        # Login, Register
        ├── styles/       # Global CSS, variables
        └── utils/        # helpers, marksUtils
```

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create a `backend/.env` file (copy from `.env.example`):
```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/Edubits
JWT_SECRET=<run: openssl rand -base64 32>
FRONTEND_URL=http://localhost:5173
PORT=5001
```

Start the server:
```bash
npm run dev       # development (nodemon)
npm start         # production
```

### 2. Frontend

```bash
cd frontend
npm install
```

Create a `frontend/.env` file (copy from `.env.example`):
```
VITE_API_URL=http://localhost:5001/api
```

Start the dev server:
```bash
npm run dev
```

Open http://localhost:5173

## Deployment

- **Backend**: Deploy to [Render](https://render.com). Set all `.env` variables in the Render dashboard. Set `FRONTEND_URL` to your Vercel domain.
- **Frontend**: Deploy to [Vercel](https://vercel.com). Set `VITE_API_URL` to your Render backend URL.

## Security Notes
- Never commit `.env` files — they are in `.gitignore`
- Generate a strong JWT secret: `openssl rand -base64 32`
- CORS is restricted to `FRONTEND_URL` only
