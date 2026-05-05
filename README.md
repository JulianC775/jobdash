# JobDash

A personal job search dashboard built with React and Flask. Search jobs from LinkedIn, Indeed, Glassdoor, and more via the [JSearch API (RapidAPI)](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch), bookmark listings, and track your application status through the full pipeline.

---

## Features

- **Multi-source job search** — powered by JSearch (aggregates LinkedIn, Indeed, Glassdoor, and others)
- **Filters** — keyword/title, location, remote-only toggle, employment type, minimum salary
- **Pagination** — load more results without losing your current search
- **Bookmark jobs** — save any listing to your personal SQLite database
- **Application status tracking** — move jobs through `saved → applied → interviewing → offer / rejected`
- **Saved jobs view** — filter your bookmarks by status with a single click
- **Dark theme UI** — GitHub-inspired color palette, responsive card grid

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Create React App |
| Backend | Flask 3, Flask-CORS, Flask-SQLAlchemy |
| Database | SQLite (via SQLAlchemy ORM) |
| External API | JSearch (RapidAPI) |
| HTTP client | Axios / native `fetch` |
| Testing | pytest + pytest-flask (backend), Jest + Testing Library (frontend) |

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- A free [RapidAPI account](https://rapidapi.com) subscribed to the **JSearch** API (free tier available)

---

## Setup

### 1. Clone and configure environment

```bash
git clone https://github.com/JulianC775/jobdash.git
cd jobdash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
RAPIDAPI_KEY=your_rapidapi_key_here
FLASK_ENV=development
FLASK_SECRET_KEY=any_random_string
```

### 2. Backend

```bash
cd backend
python -m venv venv

# macOS/Linux
source venv/bin/activate
# Windows
venv\Scripts\activate

pip install -r requirements.txt
flask run          # starts on http://localhost:5000
```

The SQLite database (`jobdash.db`) is created automatically on first run.

### 3. Frontend

```bash
cd frontend
npm install
npm start          # dev server on http://localhost:3000
```

The React app proxies all `/api/*` requests to Flask via the `"proxy"` field in `frontend/package.json`.

### 4. Run both at once (optional)

From the repo root (requires `concurrently` installed via `npm install`):

```bash
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RAPIDAPI_KEY` | Yes | Your RapidAPI key for JSearch |
| `FLASK_SECRET_KEY` | Yes | Secret key for Flask session signing |
| `FLASK_ENV` | No | Set to `development` to enable debug mode |
| `DATABASE_URL` | No | SQLAlchemy URI; defaults to `sqlite:///jobdash.db` |

---

## API Reference

All endpoints are served by Flask on port `5000`.

### Jobs

| Method | Path | Query Params | Description |
|--------|------|-------------|-------------|
| `GET` | `/api/jobs/search` | `query` (required), `location`, `remote`, `employment_type`, `salary_min`, `page` | Search jobs via JSearch |

**Example:**
```
GET /api/jobs/search?query=software+engineer&location=New+York&remote=false&page=1
```

**Response:**
```json
{
  "jobs": [ { "job_id": "...", "title": "...", "company": "...", ... } ],
  "count": 10
}
```

### Bookmarks

| Method | Path | Body / Params | Description |
|--------|------|--------------|-------------|
| `GET` | `/api/bookmarks` | `?status=applied` (optional filter) | List saved jobs |
| `POST` | `/api/bookmarks` | Job object (JSON) | Save a job |
| `DELETE` | `/api/bookmarks/<id>` | — | Remove a saved job |
| `PATCH` | `/api/bookmarks/<id>/status` | `{ "status": "applied" }` | Update application status |

**Valid status values:** `saved`, `applied`, `interviewing`, `offer`, `rejected`

---

## Application Status Flow

```
[saved] → [applied] → [interviewing] → [offer]
                    ↘               ↘ [rejected]
```

Statuses are color-coded in the UI:

| Status | Color |
|--------|-------|
| Saved | Gray |
| Applied | Blue |
| Interviewing | Orange |
| Offer | Green |
| Rejected | Red |

---

## Project Structure

```
jobdash/
├── backend/
│   ├── app.py              # Flask app factory + CORS + blueprint registration
│   ├── db.py               # SQLAlchemy initialization
│   ├── models.py           # Bookmark model
│   ├── jsearch.py          # RapidAPI JSearch client + response normalization
│   ├── requirements.txt
│   └── routes/
│       ├── jobs.py         # GET /api/jobs/search
│       └── bookmarks.py    # CRUD + status update for bookmarks
│   └── tests/
│       ├── conftest.py     # Pytest fixtures (in-memory SQLite)
│       ├── test_jobs.py
│       └── test_bookmarks.py
├── frontend/
│   └── src/
│       ├── App.jsx          # Root component, tab navigation
│       ├── api/jobs.js      # fetch wrappers for all Flask endpoints
│       ├── hooks/
│       │   └── useBookmarks.js   # Bookmark state + CRUD logic
│       └── components/
│           ├── FilterBar.jsx     # Search form
│           ├── JobCard.jsx       # Individual job listing card
│           └── BookmarkList.jsx  # Saved jobs with status filter tabs
├── .env.example
├── package.json             # Root: concurrently script for running both servers
└── CLAUDE.md                # Architecture guide for Claude Code
```

---

## Development

### Backend tests

```bash
cd backend
python -m pytest                         # all tests
python -m pytest tests/test_bookmarks.py # single file
```

Tests use an in-memory SQLite database and mock the JSearch API client — no real API calls are made.

### Frontend tests

```bash
cd frontend
npm test
```

### Adding a new search filter

1. Add the query parameter in `backend/routes/jobs.py` and pass it to `jsearch.search_jobs()`
2. Handle the new param in `backend/jsearch.py`
3. Add the input/select to `frontend/src/components/FilterBar.jsx`
4. Include the param in the `URLSearchParams` builder in `frontend/src/api/jobs.js`

---

## Known Limitations

- **Single-user** — all bookmarks are stored in a shared SQLite database with no authentication
- **JSearch rate limits** — the free RapidAPI tier allows ~500 requests/month; plan accordingly
- **No result sorting** — results are returned in JSearch's default relevance order
