# Pashu-Suraksha (पशु सुरक्षा) — Production Backend Deployment Guide

This guide outlines how to deploy the FastAPI backend to a live, production HTTPS cloud environment.

---

## Architecture & Live Cloud Services Status

Your backend is already connected to real managed cloud infrastructure:

| Component | Provider / Technology | Status | Cloud URL / Host |
|---|---|---|---|
| **Production API Gateway** | **Render.com Web Service** | ✅ **LIVE & HEALTHY** | `https://pashu-suraksha-backend.onrender.com` |
| **Spatial Database** | **Neon Cloud PostgreSQL 16 + PostGIS** | ✅ **ACTIVE & SEEDED** | `ep-lingering-mud-b3aks14j-pooler.c-4.ap-southeast-1.aws.neon.tech` |
| **Outbreak Pub/Sub** | **Upstash Serverless Redis** | ✅ **ACTIVE & RESPONDING** | `able-tiger-81031.upstash.io:6379` |
| **Multimodal AI** | **Google Gemini 3.7 / 2.5 Flash** | ✅ **CONFIGURED** | Google GenAI Cloud API |
| **Identity & Storage** | **Firebase Auth & Cloud Storage** | ✅ **ACTIVE** | `pashu-f51a1.firebasestorage.app` |

### Active Production Service Metadata
- **Service Name**: `pashu-suraksha-backend`
- **Render Service ID**: `srv-dajdau67bikc73bkrgeg`
- **Dashboard**: [https://dashboard.render.com/web/srv-dajdau67bikc73bkrgeg](https://dashboard.render.com/web/srv-dajdau67bikc73bkrgeg)
- **Live Health Check**: [https://pashu-suraksha-backend.onrender.com/health](https://pashu-suraksha-backend.onrender.com/health)
- **OpenAPI Interactive Documentation**: [https://pashu-suraksha-backend.onrender.com/docs](https://pashu-suraksha-backend.onrender.com/docs)
- **Region**: `singapore` (`ap-southeast-1`)
- **Auto-Deploy**: Enabled on `git push origin main`

All 9 official users and registered INAPH tagged livestock have already been synchronized directly into both **Firebase Auth** and **Neon PostgreSQL**.


---

## Deployment Options

Choose the cloud platform you prefer:

### Option 1: Render.com (Recommended — 2-minute Setup)

Render provides free HTTPS web services with automatic CI/CD on git push.

1. Push your repository to **GitHub** or **GitLab**.
2. Go to [https://dashboard.render.com](https://dashboard.render.com) and click **New +** $\rightarrow$ **Web Service**.
3. Connect your repository.
4. Configure the service:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3` (or `Docker`)
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/health`
5. Under **Environment Variables**, copy the values from your local `backend/.env` file:
   ```text
   DATABASE_URL=<YOUR_NEON_POSTGRESQL_CONNECTION_STRING>
   REDIS_URL=<YOUR_UPSTASH_REDIS_CONNECTION_STRING>
   GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>
   GEMINI_MODEL=gemini-2.5-flash
   FIREBASE_STORAGE_BUCKET=pashu-f51a1.firebasestorage.app
   DPDP_PHONE_SALT=pashu_dpdp_secret_salt_2026
   FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json
   ```
6. Click **Deploy Web Service**.
7. Once deployed, Render assigns a public HTTPS URL (e.g. `https://pashu-backend.onrender.com`).

---

### Option 2: Railway.app (Fastest Container Deploy)

Railway provides 1-click Docker builds with no configuration.

1. Go to [https://railway.app](https://railway.app) $\rightarrow$ **New Project** $\rightarrow$ **Deploy from GitHub repo**.
2. Select the repository and specify the `backend` folder.
3. Railway automatically detects [backend/Dockerfile](file:///d:/pashu%20sih/backend/Dockerfile).
4. Add the environment variables from above in the **Variables** tab.
5. In **Settings** $\rightarrow$ **Networking**, click **Generate Domain**.
6. Railway assigns a live domain (e.g. `https://pashu-backend.up.railway.app`).

---

### Option 3: Google Cloud Run (GCP Production)

For official government / National Hackathon production:

```bash
cd backend
gcloud run deploy pashu-suraksha-api \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8000 \
  --set-env-vars DATABASE_URL="postgresql+asyncpg://...",REDIS_URL="rediss://...",GEMINI_API_KEY="..."
```

---

## Connecting the Mobile APK & Web GIS to the Deployed Backend

Once you have your live HTTPS URL (e.g., `https://pashu-api.onrender.com`):

1. Open `mobile/.env` and update line 10:
   ```env
   VITE_API_BASE_URL="https://your-live-backend-url.onrender.com/api/v1"
   ```
2. Recompile the production APK:
   ```bash
   cd mobile
   npm run build
   npx cap sync android
   cd android
   .\gradlew.bat assembleDebug
   ```
3. The resulting APK at `d:\pashu sih\pashu-suraksha-debug.apk` will now connect to your live production cloud backend anywhere in the world on real 4G/5G mobile networks!
