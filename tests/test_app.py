from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    # Expect a mapping of activities
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_and_unregister_flow():
    activity = "Chess Club"
    email = "test_student@example.com"

    # Ensure email not already present
    resp = client.get("/activities")
    assert resp.status_code == 200
    participants = resp.json()[activity]["participants"]
    if email in participants:
        # If already present from previous run, unregister first
        resp = client.request("DELETE", f"/activities/{activity}/unregister", json={"email": email})
        assert resp.status_code == 200

    # Signup
    resp = client.post(f"/activities/{activity}/signup", json={"email": email})
    assert resp.status_code == 200
    assert "Signed up" in resp.json()["message"]

    # Verify participant present
    resp = client.get("/activities")
    assert resp.status_code == 200
    participants = resp.json()[activity]["participants"]
    assert email in participants

    # Duplicate signup should fail
    resp = client.post(f"/activities/{activity}/signup", json={"email": email})
    assert resp.status_code == 400

    # Unregister
    resp = client.request("DELETE", f"/activities/{activity}/unregister", json={"email": email})
    assert resp.status_code == 200
    assert "Unregistered" in resp.json()["message"]

    # Verify removed
    resp = client.get("/activities")
    assert resp.status_code == 200
    participants = resp.json()[activity]["participants"]
    assert email not in participants
