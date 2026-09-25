from functools import lru_cache
from typing import Literal

from pydantic import HttpUrl, PostgresDsn, SecretStr, computed_field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PYTHON_ENV: Literal["development", "production"] = "development"
    SECRET_KEY: SecretStr

    POSTGRES_USER: str
    POSTGRES_PASSWORD: SecretStr
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_DB: str

    SUPABASE_URL: HttpUrl
    SUPABASE_JWKS_URL: HttpUrl
    SUPABASE_SECRET_KEY: SecretStr
    SUPABASE_PUBLIC_KEY: SecretStr

    @computed_field
    @property
    def is_dev(self) -> bool:
        return self.PYTHON_ENV == "development"

    @computed_field
    @property
    def is_prod(self) -> bool:
        return self.PYTHON_ENV == "production"

    @computed_field
    @property
    def database_url(self) -> str:
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            host=self.POSTGRES_HOST,
            port=self.POSTGRES_PORT,
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD.get_secret_value(),
            path=self.POSTGRES_DB,
        ).encoded_string()


@lru_cache
def _get_settings() -> Settings:
    return Settings()


settings = Settings()
