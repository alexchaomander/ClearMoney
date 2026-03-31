import json
from typing import Any

from cryptography.fernet import Fernet
from sqlalchemy import Text, TypeDecorator

from app.core.config import settings

class EncryptedJSON(TypeDecorator[dict[str, Any] | None]):
    """Stores a JSON-serializable dict as a Fernet-encrypted string.

    Requires ``STRATA_CREDENTIALS_ENCRYPTION_KEY`` to be set to a valid
    Fernet key.  Generate one with ``python -c "from cryptography.fernet
    import Fernet; print(Fernet.generate_key().decode())"``.
    """

    impl = Text
    cache_ok = True

    @property
    def _fernet(self) -> Fernet:
        key = settings.credentials_encryption_key
        if not key:
            raise RuntimeError(
                "STRATA_CREDENTIALS_ENCRYPTION_KEY must be set before encrypted "
                "connection credentials can be read or written."
            )
        return Fernet(key.encode())

    def process_bind_param(
        self, value: dict[str, Any] | None, dialect: Any
    ) -> str | None:
        if value is None:
            return None
        plaintext = json.dumps(value)
        return self._fernet.encrypt(plaintext.encode()).decode()

    def process_result_value(
        self, value: str | None, dialect: Any
    ) -> dict[str, Any] | None:
        if value is None:
            return None
        plaintext = self._fernet.decrypt(value.encode()).decode()
        return json.loads(plaintext)
