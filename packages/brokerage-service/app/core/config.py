from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Brokerage Service"
    version: str = "0.1.0"
    debug: bool = False
    internal_token: str = ""
    snaptrade_client_id: str = ""
    snaptrade_consumer_key: str = ""

    model_config = {"env_prefix": "BROKERAGE_"}


settings = Settings()
