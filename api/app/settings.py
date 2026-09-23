from functools import lru_cache

from pydantic import PostgresDsn, SecretStr, computed_field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    POSTGRES_USER: str
    POSTGRES_PASSWORD: SecretStr
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_DB: str

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
