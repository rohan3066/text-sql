import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import get_admin_db, get_readonly_db

client = TestClient(app)

# A simple mock DB session generator
def override_get_db():
    try:
        yield None
    finally:
        pass

# Override dependencies if needed (e.g., for DB mocking)
# app.dependency_overrides[get_admin_db] = override_get_db

def test_health_check():
    """Test the root endpoint / health check"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "Text-to-SQL AI API"}

def test_unauthorized_access():
    """Test that protected endpoints require authentication"""
    response = client.get("/api/dashboard/metrics")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

def test_login_invalid_credentials():
    """Test login endpoint with bad credentials"""
    response = client.post(
        "/api/auth/login",
        data={"username": "wronguser", "password": "wrongpassword"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]

# We would add more tests here with proper DB mocking or a test database setup,
# testing AI integration, SQL validation, and execution.
