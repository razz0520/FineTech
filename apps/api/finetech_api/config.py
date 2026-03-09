from typing import Any
import json
from functools import lru_cache
from pydantic import AnyUrl, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    env: str = "development"
    database_url: AnyUrl | str = "postgresql+asyncpg://postgres:postgres@localhost:5432/finetech"
    cors_origins: Any = [
        "http://localhost:3000",
        "https://fine-tech-web.vercel.app",
    ]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            if not v:
                return []
            try:
                # Try parsing as JSON first
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, TypeError):
                pass
            # Fallback to comma-separated
            return [i.strip() for i in v.split(",")]
        return v

    model_config = {"env_prefix": "FINETECH_", "env_file": ".env"}


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()

