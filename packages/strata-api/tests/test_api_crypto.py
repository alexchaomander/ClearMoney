from decimal import Decimal

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.user import User
from app.services.providers.alchemy import alchemy_provider
from app.services.providers.stock_price import stock_price_service


def _url(name: str, **path_params: str) -> str:
    return str(app.url_path_for(name, **path_params))


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
            _url("list_crypto_wallets"),
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_add_wallet_and_list(test_user: User) -> None:
    wallet_data = {
        "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        "chain": "ethereum",
        "label": "My ETH Wallet",
    }

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        add_response = await client.post(
            _url("add_crypto_wallet"),
            json=wallet_data,
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        assert add_response.status_code == 200

        list_response = await client.get(
            _url("list_crypto_wallets"),
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        assert list_response.status_code == 200
        data = list_response.json()
        assert len(data) == 1
        assert data[0]["address"] == wallet_data["address"]
        assert data[0]["chain"] == wallet_data["chain"]


@pytest.mark.asyncio
async def test_get_portfolio_aggregates_native_and_token_balances(
    monkeypatch: pytest.MonkeyPatch, test_user: User
) -> None:
    wallet_data = {
        "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        "chain": "ethereum",
        "label": "My ETH Wallet",
    }

    async def fake_get_balance(chain: str, address: str) -> Decimal:
        assert address == wallet_data["address"]
        return Decimal("2.5")

    async def fake_get_token_balances(
        chain: str, address: str
    ) -> list[dict[str, object]]:
        assert address == wallet_data["address"]
        return [
            {
                "symbol": "USDC",
                "name": "USD Coin",
                "balance": Decimal("125.5"),
                "logo_url": "https://example.com/usdc.png",
                "contract_address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            }
        ]

    async def fake_get_crypto_price(symbol: str, market: str = "USD") -> Decimal:
        prices = {"ETH": Decimal("2000"), "USDC": Decimal("1")}
        return prices[symbol]

    monkeypatch.setattr(alchemy_provider, "get_balance", fake_get_balance)
    monkeypatch.setattr(alchemy_provider, "get_token_balances", fake_get_token_balances)
    monkeypatch.setattr(stock_price_service, "get_crypto_price", fake_get_crypto_price)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.post(
            _url("add_crypto_wallet"),
            json=wallet_data,
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        response = await client.get(
            _url("get_crypto_portfolio"),
            headers={"x-clerk-user-id": test_user.clerk_id},
        )

    assert response.status_code == 200
    data = response.json()
    assert len(data["wallets"]) == 1
    assert data["wallets"][0]["address"] == wallet_data["address"]
    assert [asset["symbol"] for asset in data["assets"]] == ["ETH", "USDC"]
    assert data["assets"][0]["name"] == "Ethereum"
    assert data["assets"][0]["balance_usd"] == "5000.0"
    assert data["assets"][1]["contract_address"] == (
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    )
    assert data["total_value_usd"] == "5125.50"
    assert data["defi_positions"][0]["protocol_name"] == "Aave V3"


@pytest.mark.asyncio
async def test_add_bitcoin_wallet_and_portfolio(
    monkeypatch: pytest.MonkeyPatch, test_user: User
) -> None:
    wallet_data = {
        "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        "chain": "bitcoin",
        "label": "Satoshi Wallet",
    }

    async def fake_get_balance(chain: str, address: str) -> Decimal:
        assert address == wallet_data["address"]
        return Decimal("1.25")

    async def fake_get_crypto_price(symbol: str, market: str = "USD") -> Decimal:
        assert symbol == "BTC"
        return Decimal("64000")

    monkeypatch.setattr(alchemy_provider, "get_balance", fake_get_balance)
    monkeypatch.setattr(stock_price_service, "get_crypto_price", fake_get_crypto_price)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.post(
            _url("add_crypto_wallet"),
            json=wallet_data,
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        response = await client.get(
            _url("get_crypto_portfolio"),
            headers={"x-clerk-user-id": test_user.clerk_id},
        )

    assert response.status_code == 200
    data = response.json()
    assert any(w["chain"] == "bitcoin" for w in data["wallets"])
    assert data["assets"][0]["symbol"] == "BTC"
    assert data["assets"][0]["name"] == "Bitcoin"
    assert data["total_value_usd"] == "80000.00"


@pytest.mark.asyncio
async def test_delete_all_wallets_clears_tracked_wallets(test_user: User) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        for chain, address in [
            ("ethereum", "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"),
            ("solana", "So11111111111111111111111111111111111111112"),
        ]:
            response = await client.post(
                _url("add_crypto_wallet"),
                json={"address": address, "chain": chain},
                headers={"x-clerk-user-id": test_user.clerk_id},
            )
            assert response.status_code == 200

        delete_response = await client.delete(
            _url("delete_all_crypto_wallets"),
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        assert delete_response.status_code == 204

        list_response = await client.get(
            _url("list_crypto_wallets"),
            headers={"x-clerk-user-id": test_user.clerk_id},
        )

    assert list_response.status_code == 200
    assert list_response.json() == []
