# UniGigs

**UniGigs** is a student-focused freelance and gig marketplace that connects students who offer skills with clients who need work completed.

The platform lets freelancers discover gigs and submit proposals, while clients can post gigs and review applications.

---

## Features

- 🔐 User registration and JWT-based login
- 👤 Freelancer and client roles
- 💼 Create and browse gigs
- 🔎 Explore available freelance opportunities
- 📝 Submit proposals with bid amounts and cover letters
- 📋 Track applications and proposal status
- 📊 User dashboard
- 📱 Responsive UI
- 🌸 Distinctive cherry-blossom inspired visual identity
- 🌙 Light and dark mode

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Build Tool | Vite |
| Routing | React Router |
| Backend | FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| Authentication | JWT |
| Migrations | Alembic |
| Testing | Pytest / HTTPX |
| Linting | ESLint / Ruff |
| CI | GitHub Actions |
| Deployment | Render |

---

## Project Structure

```text
freelance-hub/
├── frontend/          # React + TypeScript application
│   ├── src/
│   └── package.json
│
├── backend/           # FastAPI application
│   ├── app/
│   ├── tests/
│   ├── alembic/
│   ├── alembic.ini
│   └── requirements.txt
│
├── docs/              # Project documentation
├── .github/
│   └── workflows/     # GitHub Actions
├── .gitignore
└── README.md
````

---

## Architecture

```text
                ┌─────────────────┐
                │     Browser     │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ React Frontend  │
                │ TypeScript/Vite │
                └────────┬────────┘
                         │ HTTP/JSON
                         ▼
                ┌─────────────────┐
                │ FastAPI Backend │
                └────────┬────────┘
                         │ SQLAlchemy
                         ▼
                ┌─────────────────┐
                │   PostgreSQL    │
                └─────────────────┘
```

---

## Main User Flows

### Freelancer

```text
Register
   ↓
Login
   ↓
Explore Gigs
   ↓
View Gig
   ↓
Submit Proposal
   ↓
Track Application
```

### Client

```text
Register
   ↓
Login
   ↓
Create Gig
   ↓
Receive Proposals
   ↓
Review Applications
```

---

## API

The backend exposes a REST API.

### Authentication

```http
POST /api/users/register
POST /api/users/login
```

### Gigs

```http
POST /api/jobs
GET /api/jobs
```

### Proposals

```http
POST /api/proposals
GET /api/jobs/{id}/proposals
```

Interactive API documentation is available through FastAPI/Swagger at:

```text
http://127.0.0.1:8000/docs
```

---

## Database

The marketplace data model is designed around entities such as:

* Student
* Client
* Category
* Gig
* Application
* Contract
* Payment
* Review
* Skill
* StudentSkill
* GigSkill

Core relationships include:

```text
Client 1 ─── * Gig
Category 1 ─── * Gig
Student 1 ─── * Application
Gig 1 ─── * Application
Application 1 ─── 1 Contract
Contract 1 ─── * Payment
Contract 1 ─── * Review
```

---

## Getting Started

### Prerequisites

Install:

* Git
* Node.js and npm
* Python 3.12
* PostgreSQL

### Clone the repository

```bash
git clone https://github.com/zarinroushan/freelance-hub.git
cd freelance-hub
```

### Backend

```powershell
cd backend
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

### Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend normally runs at:

```text
http://localhost:5173
```

If port `5173` is already in use, Vite may select another port.

---

## Environment Variables

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/freelance-hub
SECRET_KEY=YOUR_SECRET_KEY
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

**Never commit `.env` or real credentials to Git.**

---

## Database Migrations

UniGigs uses Alembic for database migrations.

```bash
alembic current
alembic upgrade head
alembic check
```

Before production deployment, make sure the migration history matches the current SQLAlchemy models.

---

## Testing

Backend tests are organized into:

```text
backend/tests/
├── unit/
├── integration/
└── contract/
```

Run the test suite with:

```bash
pytest
```

The Sprint 1 API contract should cover registration, login, job creation, job browsing, proposal submission, and proposal viewing.

---

## Git Workflow

`main` should remain deployable. Development should happen on feature branches.

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature
```

After making changes:

```bash
git add .
git commit -m "Describe the change"
git push -u origin feature/your-feature
```

Then open a Pull Request into `main`.

### Recommended workflow

```text
Feature Branch
      ↓
Commit
      ↓
Push
      ↓
Pull Request
      ↓
Code Review
      ↓
CI Checks
      ↓
Merge → main
```

Do not commit local environments or secrets.

Recommended `.gitignore` entries:

```gitignore
backend/venv/
node_modules/
__pycache__/
*.py[cod]
.env
```

---

## UI/UX

UniGigs has a friendly, professional student-oriented design.

### Visual direction

* Clean layouts
* Strong blue primary actions
* Subtle pink accents
* Rounded cards
* Soft borders and shadows
* Cherry-blossom inspired decorations
* Light and dark themes

The cherry-blossom identity is intentionally subtle so the marketplace remains professional rather than looking overly decorative.

### Responsive targets

The UI is primarily designed around desktop while supporting:

```text
1440px
1280px
1024px
768px
480px
375px
```

The application should not have horizontal overflow.

---

## Deployment

The current deployment target is **Render**.

### Production architecture

```text
GitHub Repository
       │
       ├── frontend/ ──► Render Static Site
       │
       ├── backend/  ──► Render Web Service
       │
       └── PostgreSQL ─► Render Database
```

### Backend

Render Web Service:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Required environment variables:

```text
DATABASE_URL
SECRET_KEY
CORS_ORIGINS
```

### Frontend

Render Static Site:

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

For React Router, configure the rewrite:

```text
/* → /index.html
```

After deployment, configure the frontend to use the production backend URL and set the backend CORS origin to the production frontend URL.

---

## Sprint 1

### S1-01 — Registration & Login

* User roles
* Registration API
* Login API
* JWT authentication
* React authentication forms

### S1-02 — Gigs

* Job database model
* Create job API
* Browse jobs API
* Pagination
* Job listing UI
* Job creation UI

### S1-03 — Proposals

* Proposal database model
* Submit proposal API
* View proposals API
* Proposal submission UI
* Application tracking

---

## Definition of Done

A feature is considered complete when:

* [ ] Pull Request has been reviewed
* [ ] Tests pass
* [ ] Linting passes
* [ ] API behavior matches the agreed contract
* [ ] Required database migrations are included
* [ ] Feature has been manually tested
* [ ] No critical/high-priority bugs remain

---

## Roadmap

### Current

* [x] React frontend
* [x] FastAPI backend
* [x] PostgreSQL database
* [x] Authentication
* [x] Gig browsing
* [x] Proposal functionality
* [ ] Final UI/UX refinement
* [ ] Complete CI coverage
* [ ] Production deployment

### Future

* User profiles
* Skills and categories
* Saved gigs
* Messaging
* Notifications
* Contracts
* Payments
* Reviews
* Portfolio items
* Advanced search and filtering

---

## Repository

**GitHub:**
[https://github.com/zarinroushan/freelance-hub](https://github.com/zarinroushan/freelance-hub)

---

## License

This project is currently developed as an academic/student project.
