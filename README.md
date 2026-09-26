# 🌸 UniGigs — Student Freelance & Gig Marketplace

UniGigs is a student-focused freelance marketplace that connects students offering skills and services with clients looking for affordable solutions.

## 🚀 Features

- 🔐 Student & Client registration/login
- 🎯 JWT-based authentication
- 💼 Create and browse gigs
- 🔎 Search, filtering and pagination
- 📝 Submit and manage applications/proposals
- 👤 User profiles and skills
- 💬 Messaging
- 📄 Contracts and deliverables
- ⭐ Reviews
- 🔔 Notifications
- 💾 Saved gigs

---

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Axios
- React Router

### Backend
- Python
- FastAPI
- SQLAlchemy
- JWT Authentication
- Alembic

### Database
- PostgreSQL

### Deployment
- Vercel — Frontend
- Render — Backend
- Render PostgreSQL — Database

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      UniGigs User    │
                         │  Student / Client    │
                         └──────────┬───────────┘
                                    │
                                    │ HTTPS
                                    ▼
                    ┌─────────────────────────────┐
                    │       React Frontend        │
                    │     TypeScript + Vite       │
                    │          Vercel             │
                    └─────────────┬───────────────┘
                                  │
                                  │ REST API
                                  │ JSON + JWT
                                  ▼
                    ┌─────────────────────────────┐
                    │       FastAPI Backend       │
                    │           Render            │
                    │                             │
                    │  ┌───────────────────────┐  │
                    │  │ Authentication / JWT  │  │
                    │  │ Users & Profiles      │  │
                    │  │ Gigs & Categories     │  │
                    │  │ Applications          │  │
                    │  │ Contracts             │  │
                    │  │ Messages              │  │
                    │  │ Reviews               │  │
                    │  │ Notifications         │  │
                    │  └───────────────────────┘  │
                    └─────────────┬───────────────┘
                                  │
                                  │ SQLAlchemy ORM
                                  ▼
                    ┌─────────────────────────────┐
                    │       PostgreSQL            │
                    │          Render             │
                    │                             │
                    │ Users / Gigs / Applications │
                    │ Contracts / Messages / etc. │
                    └─────────────────────────────┘
````

### Request Flow

```text
User
  ↓
React Frontend
  ↓
Axios / REST API
  ↓
FastAPI
  ↓
JWT Authentication & Validation
  ↓
Business Logic
  ↓
SQLAlchemy
  ↓
PostgreSQL
  ↓
Response
  ↓
React UI
```

---

# 📂 Project Structure

```text
freelance-hub/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── security.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── gig.py
│   │   │   ├── application.py
│   │   │   ├── contract.py
│   │   │   ├── payment.py
│   │   │   ├── review.py
│   │   │   ├── notification.py
│   │   │   └── ...
│   │   │
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── gigs.py
│   │       ├── applications.py
│   │       ├── contracts.py
│   │       ├── messages.py
│   │       ├── reviews.py
│   │       └── notifications.py
│   │
│   ├── alembic/
│   │   └── versions/
│   │
│   ├── requirements.txt
│   ├── alembic.ini
│   └── build.sh
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
├── .gitignore
└── README.md
```

---

# ⚙️ Local Setup

## Prerequisites

Make sure the following are installed:

* Python 3.12
* Node.js
* npm
* PostgreSQL
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/zarinroushan/freelance-hub.git
cd freelance-hub
```

---

# 🐍 Backend Setup

### 2. Go to the backend directory

```bash
cd backend
```

### 3. Create a virtual environment

Windows:

```powershell
py -3.12 -m venv venv
```

### 4. Activate the virtual environment

```powershell
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks the activation script, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
```

Then activate again:

```powershell
.\venv\Scripts\Activate.ps1
```

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

### 6. Create the backend `.env`

Create:

```text
backend/.env
```

Add:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/freelance-hub

JWT_SECRET_KEY=YOUR_SECRET_KEY
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

CORS_ORIGINS=http://localhost:5173
APP_ENV=development
```

Replace the database password and JWT secret with your own values.

### 7. Run database migrations

```bash
alembic upgrade head
```

### 8. Start the backend

```bash
python -m uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

Health check:

```text
http://127.0.0.1:8000/health
```

---

# ⚛️ Frontend Setup

Open a **new terminal**.

### 9. Go to the frontend directory

From the project root:

```bash
cd frontend
```

### 10. Install dependencies

```bash
npm install
```

### 11. Create frontend `.env`

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:8000/api
```

### 12. Start the frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🧪 Production Build

To verify the frontend production build:

```bash
npm run build
```

The generated production files are placed in:

```text
frontend/dist/
```

---

# ☁️ Deployment

## Frontend — Vercel

The React/Vite frontend is deployed on Vercel.

**Production Frontend:**

[https://unigigs-three.vercel.app](https://unigigs-three.vercel.app)

### Vercel Configuration

```text
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Production environment variable:

```env
VITE_API_URL=https://unigigs-backend-62c0.onrender.com/api
```

---

## Backend — Render

The FastAPI backend is deployed on Render.

**Production Backend:**

[https://unigigs-backend-62c0.onrender.com](https://unigigs-backend-62c0.onrender.com)

**Swagger API Documentation:**

[https://unigigs-backend-62c0.onrender.com/docs](https://unigigs-backend-62c0.onrender.com/docs)

**Health Check:**

[https://unigigs-backend-62c0.onrender.com/health](https://unigigs-backend-62c0.onrender.com/health)

### Render Configuration

```text
Python Version: 3.12.7

Build Command:
./build.sh

Start Command:
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Database migrations are executed during deployment using Alembic.

---

## 🗄️ Production Database

The production PostgreSQL database is hosted on Render.

The backend connects to it using the `DATABASE_URL` environment variable.

Database credentials are stored as environment variables and are **not committed to GitHub**.

---

# 🔒 Environment Variables

## Backend

```env
DATABASE_URL=
JWT_SECRET_KEY=
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=
APP_ENV=production
```

## Frontend

```env
VITE_API_URL=
```

### ⚠️ Security

Never commit:

```text
.env
.env.*
Database passwords
JWT secrets
API keys
Production credentials
```

These files are excluded using `.gitignore`.

---

# 🌐 API Documentation

FastAPI provides interactive Swagger documentation:

[https://unigigs-backend-62c0.onrender.com/docs](https://unigigs-backend-62c0.onrender.com/docs)

Main API groups include:

```text
Authentication
Users & Profiles
Gigs
Categories
Applications
Contracts
Messages
Reviews
Notifications
```

---

# 📌 Deployment Status

```text
Frontend (Vercel)        ✅ Live
Backend (Render)         ✅ Live
PostgreSQL (Render)      ✅ Connected
JWT Authentication       ✅ Implemented
Alembic Migrations       ✅ Configured
Swagger Documentation    ✅ Available
Production API           ✅ Connected
```
