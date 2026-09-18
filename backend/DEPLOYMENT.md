# Deploying Backend to Render

This guide outlines how to deploy the **UniGigs FastAPI Backend** to [Render](https://render.com).

---

## Option 1: Automatic Blueprint Deployment (Recommended)

1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository (`freelance-hub`).
4. Render will automatically detect `render.yaml` and prompt you to create:
   - **PostgreSQL Database**: `unigigs-db`
   - **Web Service**: `unigigs-backend`
5. Click **Apply**. Render will automatically provision the database, inject `DATABASE_URL` and `JWT_SECRET_KEY`, install dependencies, run migrations, and start the app.

---

## Option 2: Manual Web Service Deployment

If you prefer setting up services manually:

### Step 1: Create a PostgreSQL Database on Render
1. On Render Dashboard, click **New +** -> **PostgreSQL**.
2. **Name**: `unigigs-db` (or any preferred name).
3. **Database Name**: `unigigs`.
4. **User**: `unigigs_user`.
5. Select the **Free** instance type (or desired plan).
6. Click **Create Database**.
7. Copy the **Internal Database URL** once created.

---

### Step 2: Create the Web Service
1. Click **New +** -> **Web Service**.
2. Connect your Git repository (`freelance-hub`).
3. Configure the following fields:
   - **Name**: `unigigs-backend`
   - **Region**: (Choose closest to your users)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend` (or `freelance-hub/backend` if repo structure is nested)
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh` (or `pip install -r requirements.txt && alembic upgrade head`)
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

### Step 3: Environment Variables
Under the **Environment** tab of your Web Service, add the following key-value pairs:

| Key | Value / Example | Notes |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgres://unigigs_user:...` | Paste the **Internal Database URL** from Step 1 |
| `JWT_SECRET_KEY` | `your-secret-key-at-least-32-chars-long` | Random secure string |
| `JWT_ALGORITHM` | `HS256` | Default JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token expiry |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token expiry |
| `CORS_ORIGINS` | `https://your-frontend.onrender.app,http://localhost:5173` | Comma-separated allowed origin URLs (or `*`) |
| `APP_ENV` | `production` | Set environment mode |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Frontend URL used after OAuth |
| `GOOGLE_CLIENT_ID` | (from Google Cloud) | OAuth client ID; keep out of source files |
| `GOOGLE_CLIENT_SECRET` | (from Google Cloud) | OAuth client secret; backend only |
| `GOOGLE_REDIRECT_URI` | `https://your-backend.onrender.com/api/auth/google/callback` | Must exactly match the Google OAuth client |

### Google Sign-In local setup

1. In Google Cloud Console, create an OAuth 2.0 Web application client.
2. Add `http://localhost:8000/api/auth/google/callback` as an authorized redirect URI.
3. In `backend/.env`, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and (optionally) `GOOGLE_REDIRECT_URI` to that local callback. Set `FRONTEND_URL=http://localhost:5173`.
4. For deployment, set the same variables in the Render service, using the deployed backend callback URL and the deployed frontend URL. Never add the client secret to Vite variables or commit it.

---

## Verification & Health Check

Once the deployment completes:
- Access your backend URL: `https://<your-app-name>.onrender.app/`
- Health check endpoint: `https://<your-app-name>.onrender.app/health`
- Interactive API Docs (Swagger): `https://<your-app-name>.onrender.app/docs`
