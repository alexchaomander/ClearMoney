import asyncio
import os
import sys
from cryptography.fernet import Fernet
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def main():
    old_key = os.getenv("OLD_ENCRYPTION_KEY")
    new_key = os.getenv("NEW_ENCRYPTION_KEY")
    db_url = os.getenv("DATABASE_URL")

    if not old_key or not new_key or not db_url:
        print("Error: OLD_ENCRYPTION_KEY, NEW_ENCRYPTION_KEY, and DATABASE_URL must be set.")
        sys.exit(1)

    print(f"Connecting to database: {db_url.split('@')[-1] if '@' in db_url else db_url}")
    
    # Create the engine
    engine = create_async_engine(db_url)
    
    old_fernet = Fernet(old_key.encode())
    new_fernet = Fernet(new_key.encode())

    async with engine.begin() as conn:
        # Fetch all connections
        result = await conn.execute(text("SELECT id, credentials FROM connections WHERE credentials IS NOT NULL"))
        rows = result.fetchall()
        
        print(f"Found {len(rows)} connections with credentials to rotate.")
        
        updated_count = 0
        for row in rows:
            conn_id = row.id
            encrypted_creds = row.credentials
            
            try:
                # Decrypt with old key
                plaintext = old_fernet.decrypt(encrypted_creds.encode())
                
                # Encrypt with new key
                new_encrypted = new_fernet.encrypt(plaintext).decode()
                
                # Update record
                await conn.execute(
                    text("UPDATE connections SET credentials = :creds WHERE id = :id"),
                    {"creds": new_encrypted, "id": conn_id}
                )
                updated_count += 1
            except Exception as e:
                print(f"Failed to rotate credentials for connection {conn_id}: {e}")
        
        print(f"Successfully rotated {updated_count} out of {len(rows)} credentials.")

if __name__ == "__main__":
    asyncio.run(main())