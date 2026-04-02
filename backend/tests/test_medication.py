import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from main import app, lifespan
from database import engine

@pytest_asyncio.fixture(scope="session")
async def client():
    async with lifespan(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            yield ac

@pytest.mark.asyncio
async def test_add_medication_success(client):
    payload = {
        "name": "Paracetamol",
        "common_name": "Tylenol",
        "price": 50
    }
    response = await client.post("/api/v1/inventory/medication", json=payload)
    data = response.json()
    assert response.status_code == 200, f"API Error: {response.text}"
    assert data["status"] == "success"
    assert data["name"] == "Paracetamol"
    assert "med_id" in data

@pytest.mark.asyncio
async def test_add_stock_medication_not_found(client):
    payload = {
        "med_id": 999999,
        "in_day": "2026-01-01",
        "exp_day": "2027-01-01",
        "quantity": 100
    }
    response = await client.post("/api/v1/inventory/stock", json=payload)
    assert response.status_code == 404, f"API Error: {response.text}"
    assert "not found" in response.json()["detail"].lower()