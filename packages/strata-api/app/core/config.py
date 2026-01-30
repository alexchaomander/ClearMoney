from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Strata API"
    version: str = "0.1.0"
    debug: bool = False

    database_url: str = "sqlite+aiosqlite:///./strata.db"
    database_echo: bool = False
    credentials_encryption_key: str = ""

    # SnapTrade configuration
    snaptrade_client_id: str = ""
    snaptrade_consumer_key: str = ""

    # Clerk JWT validation (optional — if set, validates Bearer tokens)
    clerk_secret_key: str = ""
    clerk_pem_public_key: str = ""

    model_config = {"env_prefix": "STRATA_"}


settings = Settings()
