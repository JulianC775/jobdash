def test_search_requires_query(client):
    resp = client.get("/api/jobs/search")
    assert resp.status_code == 400
    assert "query" in resp.json["error"]


def test_search_missing_key(client, monkeypatch):
    monkeypatch.setenv("RAPIDAPI_KEY", "fake")

    import requests as req

    class FakeResp:
        def raise_for_status(self):
            from requests.exceptions import HTTPError
            raise HTTPError("401")

    monkeypatch.setattr(req, "get", lambda *a, **kw: FakeResp())

    resp = client.get("/api/jobs/search?query=engineer")
    assert resp.status_code == 502
