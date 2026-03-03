FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONUNBUFFERED=1

COPY apps/worker /app/apps/worker
WORKDIR /app/apps/worker
RUN pip install --upgrade pip && pip install .

CMD ["python", "run_ingest.py"]
