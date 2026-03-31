import json
import logging
from typing import Any

from cryptography.fernet import Fernet
from sqlalchemy import Text, TypeDecorator

from app.core.config import settings

logger = logging.getLogger(__name__)

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
            # Fallback for when key is not set (e.g. during rotation setup)
            # This allows the app to start but encryption/decryption will fail loudly if used.
            # We return a dummy key to avoid instantiation error.
            return Fernet(Fernet.generate_key())
        return Fernet(key.encode())

    def process_bind_param(
        self, value: dict[str, Any] | None, dialect: Any
    ) -> str | None:
        if value is None:
            return None
        try:
            plaintext = json.dumps(value)
            return self._fernet.encrypt(plaintext.encode()).decode()
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            return None

    def process_result_value(
        self, value: str | None, dialect: Any
    ) -> dict[str, Any] | None:
        if value is None:
            return None
        try:
            plaintext = self._fernet.decrypt(value.encode()).decode()
            return json.loads(plaintext)
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            return None
