# Deployment

## Overview

| Target | Recommended | Config |
|--------|-------------|--------|
| **Frontend** | Vercel | `apps/web/vercel.json`, Root Directory = `apps/web` |
| **API + ML** | Google Cloud Run or AWS ECS/Fargate | `infra/api.Dockerfile`, `infra/cloudrun-api.yaml` |
| **Worker** | Cloud Run Job or ECS scheduled task | `infra/worker.Dockerfile` |
| **Database** | Managed PostgreSQL (RDS, Cloud SQL, Neon, Supabase) | Set `FINETECH_DATABASE_URL` |

---

## 1. Vercel (Frontend)

### Option A: Git integration (simplest)

1. In [Vercel](https://vercel.com), import the repo.
2. Set **Root Directory** to `apps/web`.
3. **Build Command**: leave default or set to `cd ../.. && pnpm install && pnpm turbo run build --filter=@finetech/web`.
4. **Output Directory**: `.next` (default).
5. Add env vars in Project Settings → Environment Variables:
   - `NEXT_PUBLIC_API_BASE_URL` = your API URL (e.g. `https://api.yourdomain.com`)
   - `NEXT_PUBLIC_WS_URL` = your WebSocket URL (e.g. `wss://api.yourdomain.com`)

Vercel will auto-deploy on push to main.

### Option B: GitHub Actions

1. Create a [Vercel token](https://vercel.com/account/tokens).
2. In the repo: Settings → Secrets and variables → Actions. Add:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID` (from Vercel project settings → General)
   - `VERCEL_PROJECT_ID`
3. Add variable `NEXT_PUBLIC_API_BASE_URL` (Settings → Variables).
4. Push to `main`; the `Deploy` workflow will build and deploy.

---

## 2. Google Cloud Run (API)

### Build and push image

```bash
# From repo root
export PROJECT_ID=your-gcp-project
export REGION=us-central1

docker build -f infra/api.Dockerfile -t gcr.io/$PROJECT_ID/finetech-api:latest .
docker push gcr.io/$PROJECT_ID/finetech-api:latest
```

### Deploy

```bash
gcloud run deploy finetech-api \
  --image gcr.io/$PROJECT_ID/finetech-api:latest \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "FINETECH_ENV=production" \
  --set-env-vars "FINETECH_CORS_ORIGINS=https://your-app.vercel.app" \
  --set-secrets "FINETECH_DATABASE_URL=finetech-db-url:latest" \
  --memory 1Gi \
  --min-instances 0 \
  --max-instances 10
```

Or deploy from source (Cloud Build):

```bash
gcloud run deploy finetech-api \
  --source . \
  --dockerfile infra/api.Dockerfile \
  --region $REGION
```

Create the DB secret first:

```bash
echo -n "postgresql+asyncpg://user:pass@host:5432/db" | gcloud secrets create finetech-db-url --data-file=-
```

---

## 3. AWS ECS/Fargate (API)

1. Build and push to ECR:

```bash
aws ecr get-login-password --region REGION | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.REGION.amazonaws.com
docker build -f infra/api.Dockerfile -t finetech-api:latest .
docker tag finetech-api:latest ACCOUNT.dkr.ecr.REGION.amazonaws.com/finetech-api:latest
docker push ACCOUNT.dkr.ecr.REGION.amazonaws.com/finetech-api:latest
```

2. Create ECS task definition (Fargate): use the image, set `FINETECH_DATABASE_URL` and `FINETECH_CORS_ORIGINS` via secrets or env, port 8000, 1 vCPU / 1 GB memory.
3. Create ECS service behind an Application Load Balancer; health check path `/health`.

---

## 4. Database migrations

Run before first deploy or after schema changes:

```bash
# Sync URL (no +asyncpg) for Alembic
export DATABASE_URL_SYNC="postgresql://user:pass@host:5432/finetech"
cd apps/api && alembic upgrade head
```

Or from repo root:

```bash
PYTHONPATH=apps/api alembic -c apps/api/alembic.ini upgrade head
```

Set `sqlalchemy.url` in `alembic.ini` or rely on `env.py` reading `FINETECH_DATABASE_URL` (ensure it uses a sync driver for migrations or replace `+asyncpg` when running Alembic).

---

## 5. Worker (news ingestion)

- **Cloud Run Job**: Build from `infra/worker.Dockerfile`, run on schedule (e.g. Cloud Scheduler every hour). Env: `API_BASE_URL`, `NEWS_API_KEY`.
- **ECS**: Run as a scheduled task or one-off; same image, env from Secrets Manager.

---

## 6. CI/CD summary

- **`.github/workflows/ci.yml`**: Lint, build web, API smoke, Docker build on push/PR to main/develop.
- **`.github/workflows/deploy.yml`**: On push to main:
  - Build and push API and Web images to GitHub Container Registry (`ghcr.io`).
  - If `VERCEL_TOKEN` (and org/project IDs) are set, build and deploy frontend to Vercel.

Enable GitHub Packages (Settings → Actions → General) if you use `ghcr.io` for images.
