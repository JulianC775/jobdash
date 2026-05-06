def _add(client, job_id="abc123", title="Software Engineer", company="Acme", **kwargs):
    payload = {"job_id": job_id, "title": title, "company": company, **kwargs}
    return client.post("/api/bookmarks", json=payload)


def _get_id(client):
    return client.get("/api/bookmarks").json["bookmarks"][0]["id"]


def test_list_bookmarks_empty(client):
    resp = client.get("/api/bookmarks")
    assert resp.status_code == 200
    assert resp.json["bookmarks"] == []


def test_add_and_list_bookmark(client):
    resp = _add(client, location="Remote", is_remote=True)
    assert resp.status_code == 201
    assert resp.json["status"] == "saved"

    resp = client.get("/api/bookmarks")
    assert len(resp.json["bookmarks"]) == 1


def test_bookmark_stores_extra_fields(client):
    _add(client, salary_min=80000, salary_period="YEAR", employer_logo="https://example.com/logo.png",
         posted_at="2025-01-01T00:00:00Z")
    bm = client.get("/api/bookmarks").json["bookmarks"][0]
    assert bm["salary_min"] == 80000
    assert bm["salary_period"] == "YEAR"
    assert bm["employer_logo"] == "https://example.com/logo.png"
    assert bm["posted_at"] == "2025-01-01T00:00:00Z"


def test_duplicate_bookmark_rejected(client):
    _add(client, job_id="dup1")
    resp = _add(client, job_id="dup1")
    assert resp.status_code == 409


def test_add_requires_job_id(client):
    resp = client.post("/api/bookmarks", json={"title": "Dev", "company": "Co"})
    assert resp.status_code == 400


def test_update_status(client):
    _add(client)
    bid = _get_id(client)
    resp = client.patch(f"/api/bookmarks/{bid}/status", json={"status": "applied"})
    assert resp.status_code == 200
    assert resp.json["status"] == "applied"


def test_invalid_status_rejected(client):
    _add(client, job_id="s2")
    bid = _get_id(client)
    resp = client.patch(f"/api/bookmarks/{bid}/status", json={"status": "dreaming"})
    assert resp.status_code == 400


def test_status_filter(client):
    _add(client, job_id="j1")
    _add(client, job_id="j2", title="Designer", company="Co2")

    bms = client.get("/api/bookmarks").json["bookmarks"]
    bid_j1 = next(b["id"] for b in bms if b["job_id"] == "j1")
    client.patch(f"/api/bookmarks/{bid_j1}/status", json={"status": "applied"})

    resp = client.get("/api/bookmarks?status=applied")
    assert len(resp.json["bookmarks"]) == 1
    assert resp.json["bookmarks"][0]["job_id"] == "j1"

    resp = client.get("/api/bookmarks?status=saved")
    assert len(resp.json["bookmarks"]) == 1
    assert resp.json["bookmarks"][0]["job_id"] == "j2"


def test_update_notes(client):
    _add(client)
    bid = _get_id(client)

    resp = client.patch(f"/api/bookmarks/{bid}/notes", json={"notes": "Great team culture"})
    assert resp.status_code == 200
    assert resp.json["notes"] == "Great team culture"

    resp = client.get("/api/bookmarks")
    assert resp.json["bookmarks"][0]["notes"] == "Great team culture"


def test_update_notes_clears(client):
    _add(client)
    bid = _get_id(client)
    client.patch(f"/api/bookmarks/{bid}/notes", json={"notes": "something"})
    resp = client.patch(f"/api/bookmarks/{bid}/notes", json={"notes": ""})
    assert resp.json["notes"] == ""


def test_notes_requires_field(client):
    _add(client)
    bid = _get_id(client)
    resp = client.patch(f"/api/bookmarks/{bid}/notes", json={"text": "wrong key"})
    assert resp.status_code == 400


def test_delete_bookmark(client):
    _add(client)
    bid = _get_id(client)

    resp = client.delete(f"/api/bookmarks/{bid}")
    assert resp.status_code == 200

    resp = client.get("/api/bookmarks")
    assert resp.json["bookmarks"] == []


def test_delete_nonexistent(client):
    resp = client.delete("/api/bookmarks/9999")
    assert resp.status_code == 404
