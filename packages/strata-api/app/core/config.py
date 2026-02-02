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

    model_config = {"env_prefix": "STRATA_"}


settings = Settings()
