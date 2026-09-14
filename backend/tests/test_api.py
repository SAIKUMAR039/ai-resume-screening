import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

# Ensure DB tables are initialized for testing
init_db()

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["message"] == "AI Resume Screening API is active"
    assert json_data["docs"] == "/docs"

def test_api_candidates_list():
    response = client.get("/api/candidates")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_api_candidates_ranked():
    response = client.get("/api/candidates/ranked")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_screen_without_jd_error():
    response = client.post("/api/screen", data={"job_description": ""})
    assert response.status_code in (400, 422)
