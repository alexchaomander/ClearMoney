import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.crypto_wallet import CryptoChain, CryptoWallet
from app.models.user import User

@pytest.fixture
async def test_user(session: AsyncSession) -> User:
    user = User(clerk_id="crypto_test_user", email="crypto@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

@pytest.mark.asyncio
async def test_list_wallets_initially_empty(test_user: User) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/crypto/wallets",
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_add_wallet_and_list(test_user: User) -> None:
    wallet_data = {
        "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        "chain": "ethereum",
        "label": "My ETH Wallet"
    }
    
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # Add wallet
        add_response = await client.post(
            "/api/v1/crypto/wallets",
            json=wallet_data,
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        assert add_response.status_code == 200
        
        # List wallets
        list_response = await client.get(
            "/api/v1/crypto/wallets",
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        assert list_response.status_code == 200
        data = list_response.json()
        assert len(data) == 1
        assert data[0]["address"] == wallet_data["address"]
        assert data[0]["chain"] == wallet_data["chain"]

@pytest.mark.asyncio
async def test_get_portfolio_with_wallet(test_user: User) -> None:
    # Add a real-looking address
    wallet_data = {
        "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        "chain": "ethereum",
        "label": "My ETH Wallet"
    }
    
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # Add wallet
        await client.post(
            "/api/v1/crypto/wallets",
            json=wallet_data,
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        
        # Get portfolio
        response = await client.get(
            "/api/v1/crypto/portfolio",
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        
    assert response.status_code == 200
    data = response.json()
    assert "wallets" in data
    assert "total_value_usd" in data
    assert "assets" in data
    
    # Since Alchemy API key is likely missing in test env, it should fallback to 0 or mock
    # Based on our implementation, it logs a warning and returns Decimal("0.0") if no key.
    # But wait, StockPriceService returns mock prices if no key.
    # If balance is 0, assets list might be empty.
    
    assert len(data["wallets"]) == 1
    assert data["wallets"][0]["address"] == wallet_data["address"]

@pytest.mark.asyncio
async def test_add_bitcoin_wallet_and_portfolio(test_user: User) -> None:
    wallet_data = {
        "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", # Genesis block address
        "chain": "bitcoin",
        "label": "Satoshi Wallet"
    }
    
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # Add wallet
        await client.post(
            "/api/v1/crypto/wallets",
            json=wallet_data,
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        
        # Get portfolio
        response = await client.get(
            "/api/v1/crypto/portfolio",
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        
    assert response.status_code == 200
    data = response.json()
    assert any(w["chain"] == "bitcoin" for w in data["wallets"])
    # Note: assets might still be empty in tests if API keys are missing or balance is 0
