FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONUNBUFFERED=1

COPY apps/api /app/apps/api
WORKDIR /app/apps/api
RUN pip install --upgrade pip && pip install .

EXPOSE 8000
CMD ["uvicorn", "finetech_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
