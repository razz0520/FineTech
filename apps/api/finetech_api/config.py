from functools import lru_cache
from pydantic import AnyUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    env: str = "development"
    database_url: AnyUrl | str = "postgresql+asyncpg://postgres:postgres@localhost:5432/finetech"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "https://fine-tech-web.vercel.app",
    ]

    model_config = {"env_prefix": "FINETECH_", "env_file": ".env"}


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()

