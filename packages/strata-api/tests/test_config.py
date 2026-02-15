from app.core.config import Settings
import pytest


def test_cors_csv_settings_parsed() -> None:
    settings = Settings(
        cors_allow_origins="https://app.clearmoney.com,https://www.clearmoney.com",
        cors_allow_methods="GET,POST,OPTIONS",
        cors_allow_headers="Authorization,Content-Type",
    )

    assert settings.cors_allow_origins == [
        "https://app.clearmoney.com",
        "https://www.clearmoney.com",
    ]
    assert settings.cors_allow_methods == ["GET", "POST", "OPTIONS"]
    assert settings.cors_allow_headers == ["Authorization", "Content-Type"]


def test_cors_wildcard_forbidden_with_credentials() -> None:
    with pytest.raises(ValueError):
        Settings(
            cors_allow_origins="*",
            cors_allow_credentials=True,
        )
