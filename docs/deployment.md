# DRISHTIGUIDE AI — Deployment Guide

## Render Backend Deployment

1. Sign up / Log into [Render.com](https://render.com).
2. Connect Git repository.
3. Select **New Web Service**.
4. Set Build Command: `pip install -r backend/requirements.txt`.
5. Set Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6. Add Environment Variables:
   - `PYTHON_VERSION`: `3.10.12`
   - `MODEL_PATH`: `yolov8n.pt`
   - `CONFIDENCE_THRESHOLD`: `0.45`

## Frontend Static Site Deployment

1. Build static assets:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the generated `dist/` folder to Vercel, Render Static Site, or Netlify.
3. Configure environment variable: `VITE_API_URL=https://your-backend.onrender.com`.
