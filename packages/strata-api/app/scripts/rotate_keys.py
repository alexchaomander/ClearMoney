import asyncio
import sys
import logging
import json
from typing import Any

from cryptography.fernet import Fernet
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def rotate_keys(old_key: str, new_key: str, batch_size: int = 100):
    """
    Rotates the encryption key for all Connection credentials using raw SQL
    to bypass the TypeDecorator which uses the current environment key.
    """
    if not old_key or not new_key:
        logger.error("Both old_key and new_key must be provided.")
        return

    fernet_old = Fernet(old_key.encode())
    fernet_new = Fernet(new_key.encode())

    async with SessionLocal() as session:
        # Fetch raw encrypted strings
        result = await session.execute(text("SELECT id, credentials FROM connections WHERE credentials IS NOT NULL"))
        rows = result.all()
        total = len(rows)
        logger.info(f"Found {total} connections to re-encrypt.")

        processed = 0
        for i in range(0, total, batch_size):
            batch = rows[i : i + batch_size]
            for row_id, encrypted_blob in batch:
                try:
                    # Decrypt with old key
                    decrypted_data = fernet_old.decrypt(encrypted_blob.encode()).decode()
                    # Re-encrypt with new key
                    new_blob = fernet_new.encrypt(decrypted_data.encode()).decode()
                    
                    # Update row
                    await session.execute(
                        text("UPDATE connections SET credentials = :new_blob WHERE id = :row_id"),
                        {"new_blob": new_blob, "row_id": row_id}
                    )
                except Exception as e:
                    logger.error(f"Failed to rotate key for connection {row_id}: {e}")
            
            await session.commit()
            processed += len(batch)
            logger.info(f"Processed {processed}/{total}")

    logger.info("Rotation complete.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python -m app.scripts.rotate_keys <old_key> <new_key>")
        sys.exit(1)
    
    old_k = sys.argv[1]
    new_k = sys.argv[2]
    asyncio.run(rotate_keys(old_k, new_k))
