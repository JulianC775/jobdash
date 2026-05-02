def test_list_bookmarks_empty(client):
    resp = client.get("/api/bookmarks")
    assert resp.status_code == 200
    assert resp.json["bookmarks"] == []


def test_add_and_list_bookmark(client):
    payload = {
        "job_id": "abc123",
        "title": "Software Engineer",
        "company": "Acme Corp",
        "location": "Remote",
        "is_remote": True,
    }
    resp = client.post("/api/bookmarks", json=payload)
    assert resp.status_code == 201
    assert resp.json["status"] == "saved"

    resp = client.get("/api/bookmarks")
    assert len(resp.json["bookmarks"]) == 1


def test_duplicate_bookmark_rejected(client):
    payload = {"job_id": "dup1", "title": "Dev", "company": "Co"}
    client.post("/api/bookmarks", json=payload)
    resp = client.post("/api/bookmarks", json=payload)
    assert resp.status_code == 409


def test_update_status(client):
    client.post("/api/bookmarks", json={"job_id": "s1", "title": "Dev", "company": "Co"})
    resp = client.get("/api/bookmarks")
    bid = resp.json["bookmarks"][0]["id"]

    resp = client.patch(f"/api/bookmarks/{bid}/status", json={"status": "applied"})
    assert resp.status_code == 200
    assert resp.json["status"] == "applied"


def test_invalid_status_rejected(client):
    client.post("/api/bookmarks", json={"job_id": "s2", "title": "Dev", "company": "Co"})
    resp = client.get("/api/bookmarks")
    bid = resp.json["bookmarks"][0]["id"]

    resp = client.patch(f"/api/bookmarks/{bid}/status", json={"status": "dreaming"})
    assert resp.status_code == 400


def test_delete_bookmark(client):
    client.post("/api/bookmarks", json={"job_id": "d1", "title": "Dev", "company": "Co"})
    resp = client.get("/api/bookmarks")
    bid = resp.json["bookmarks"][0]["id"]

    resp = client.delete(f"/api/bookmarks/{bid}")
    assert resp.status_code == 200

    resp = client.get("/api/bookmarks")
    assert resp.json["bookmarks"] == []
