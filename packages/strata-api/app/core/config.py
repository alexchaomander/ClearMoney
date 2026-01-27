from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Strata API"
    version: str = "0.1.0"
    debug: bool = False

    database_url: str = "sqlite+aiosqlite:///./strata.db"
    database_echo: bool = False

    model_config = {"env_prefix": "STRATA_"}


settings = Settings()
