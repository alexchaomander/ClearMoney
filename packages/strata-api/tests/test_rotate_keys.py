import pytest
from cryptography.fernet import Fernet
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.connection import Connection
from app.models.user import User
from app.scripts.rotate_keys import rotate_keys

@pytest.mark.asyncio
async def test_rotate_keys_script(session: AsyncSession):
    # 1. Setup old key and data
    old_key = Fernet.generate_key().decode()
    new_key = Fernet.generate_key().decode()
    
    from app.core.config import settings
    original_key = settings.credentials_encryption_key
    settings.credentials_encryption_key = old_key
    
    user = User(clerk_id="rotate_test", email="rotate@example.com")
    session.add(user)
    await session.commit()
    user = (await session.execute(select(User).where(User.clerk_id == "rotate_test"))).scalar_one()
    
    creds = {"token": "secret_data"}
    conn = Connection(
        user_id=user.id,
        provider="test",
        provider_user_id="test_user",
        credentials=creds
    )
    session.add(conn)
    await session.commit()
    
    # SQLite stores UUIDs as hex strings by default in some configurations
    conn_id_hex = conn.id.hex
    
    # 2. Run rotation script
    await rotate_keys(old_key, new_key, session=session)
    
    # 3. Verify
    # Try multiple ways to fetch the ID since SQLite can be finicky with UUID types
    result = await session.execute(text("SELECT credentials FROM connections WHERE id = :id"), {"id": conn_id_hex})
    new_encrypted_blob = result.scalar()
    
    if new_encrypted_blob is None:
        # Fallback: fetch by row order if hex ID failed
        result = await session.execute(text("SELECT credentials FROM connections LIMIT 1"))
        new_encrypted_blob = result.scalar()

    assert new_encrypted_blob is not None
    assert Fernet(new_key.encode()).decrypt(new_encrypted_blob.encode()).decode() == '{"token": "secret_data"}'
    
    settings.credentials_encryption_key = original_key
