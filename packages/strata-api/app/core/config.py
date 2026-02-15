from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Strata API"
    version: str = "0.1.0"
    debug: bool = False

    database_url: str = "sqlite+aiosqlite:///./strata.db"
    database_echo: bool = False
    credentials_encryption_key: str = ""
    cors_allow_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    cors_allow_credentials: bool = True
    cors_allow_methods: list[str] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    cors_allow_headers: list[str] = ["Authorization", "Content-Type", "X-Clerk-User-Id", "X-Step-Up-Token"]

    # SnapTrade configuration
    snaptrade_client_id: str = ""
    snaptrade_consumer_key: str = ""

    # Plaid configuration
    plaid_client_id: str = ""
    plaid_secret: str = ""
    plaid_environment: str = "sandbox"  # sandbox | development | production
    banking_sync_interval_seconds: int = 3600
    banking_history_days: int = 730  # 2 years for initial fetch

    # Background jobs
    enable_background_jobs: bool = True
    sync_interval_seconds: int = 3600
    sync_stale_minutes: int = 60
    snapshot_interval_seconds: int = 86400

    # Clerk JWT validation (optional — if set, validates Bearer tokens)
    clerk_secret_key: str = ""
    clerk_pem_public_key: str = ""

    # Anthropic API (for Financial Advisor)
    anthropic_api_key: str = ""
    advisor_model: str = "claude-sonnet-4-20250514"
    advisor_max_tokens: int = 4096
    agent_freshness_max_hours: int = 24
    agent_runtime_mode: str = "in_process"
    agent_runtime_command: str = "python -m app.services.agent_runner"
    agent_container_command: str = ""
    agent_step_up_token: str = ""
    data_dir: str = ""
    auto_consent_on_missing: bool = False

    model_config = {"env_prefix": "STRATA_"}

    @field_validator("cors_allow_origins", "cors_allow_methods", "cors_allow_headers", mode="before")
    @classmethod
    def _split_csv_values(cls, value: object) -> object:
        """Allow comma-separated env var values for list settings."""
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @model_validator(mode="after")
    def _validate_cors_policy(self) -> "Settings":
        if self.cors_allow_credentials and "*" in self.cors_allow_origins:
            raise ValueError(
                "STRATA_CORS_ALLOW_ORIGINS cannot contain '*' when STRATA_CORS_ALLOW_CREDENTIALS=true"
            )
        return self


settings = Settings()
