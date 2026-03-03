# Finetech – Unified Financial Intelligence Platform

Monorepo for the AI-powered financial learning, prediction playground, portfolio analytics, and advisory platform.

## Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Shadcn-style UI, Recharts
- **Backend**: FastAPI (Python 3.12+), SQLAlchemy async, PostgreSQL
- **ML**: LSTM+attention (PyTorch), SHAP/LIME-style explanations, Gemini for narratives and RAG advisor
- **Auth**: SIWE (Sign-In with Ethereum), optional NextAuth
- **Infra**: Docker, Turborepo, GitHub Actions CI

## Repo layout

- `apps/web` – Next.js app (LMS, playground, portfolio, advisor)
- `apps/api` – FastAPI (LMS, market, prediction, news, portfolio, advisor, auth)
- `apps/worker` – News ingestion (NewsAPI → POST /api/news/ingest)
- `packages/ui`, `packages/types`, `packages/config` – shared frontend
- `services/ml` – LSTM+attention training and model artifacts
- `infra` – Dockerfiles, docker-compose, CI

## Quick start

1. **Install**
   - Node: `pnpm install` at repo root
   - API: `cd apps/api && pip install -e .`

2. **Database**
   - Start Postgres (e.g. `docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16`)
   - Set `FINETECH_DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/finetech`
   - Run migrations: `cd apps/api && alembic upgrade head` (from repo root: `PYTHONPATH=apps/api alembic -c apps/api/alembic.ini upgrade head`)

3. **Run**
   - API: `cd apps/api && uvicorn finetech_api.main:app --reload`
   - Web: `pnpm dev` (from root) or `cd apps/web && pnpm dev`

4. **Optional**
   - Train LSTM: `cd services/ml && pip install -e . && python -m timeseries.train_lstm_attention --out artifacts/model.pt`
   - Set `FINETECH_MODEL_PATH` to the saved model for prediction.
   - Set `GEMINI_API_KEY` for the AI advisor and narrative explanations.
   - Set `NEWS_API_KEY` for news ingestion; run worker or call POST `/api/news/ingest` with articles.

## Docker

From repo root:

```bash
docker compose -f infra/docker-compose.yml up --build
```

- Web: http://localhost:3000  
- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  

## Deployment

- **Frontend**: Vercel (set Root Directory to `apps/web`). See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
- **API / Worker**: Use `infra/api.Dockerfile` and `infra/worker.Dockerfile` with Google Cloud Run or AWS ECS/Fargate.
- **CI**: `.github/workflows/deploy.yml` builds and pushes API/Web images to GHCR and can deploy the web app to Vercel when `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are set.  

## Environment

- `FINETECH_DATABASE_URL` – PostgreSQL async URL
- `FINETECH_MODEL_PATH` – Path to LSTM model .pt (optional)
- `GEMINI_API_KEY` – Gemini for advisor/narrative (optional)
- `NEWS_API_KEY` – NewsAPI for worker (optional)
- `NEXT_PUBLIC_API_BASE_URL` – API base for the web app (e.g. http://localhost:8000)
- `NEXT_PUBLIC_DEV_USER_ID` – Default user UUID for dev (e.g. 00000000-0000-0000-0000-000000000001)

## Disclaimer

This platform is for education and paper-trading only. It does not provide execution, personalized financial advice, or real-money trading.
