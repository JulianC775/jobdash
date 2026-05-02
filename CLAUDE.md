# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**jobdash** is a full-stack job search dashboard. A Flask backend proxies all JSearch API (RapidAPI) calls, handles filtering logic, and manages a SQLite database of saved/bookmarked jobs. A React frontend communicates with the Flask backend via REST endpoints.

## Architecture

```
jobdash/
├── backend/        # Flask app
│   ├── app.py      # App factory, route registration
│   ├── routes/     # Blueprints: jobs.py, bookmarks.py
│   ├── models.py   # SQLAlchemy models (Job, Bookmark)
│   ├── db.py       # SQLite/SQLAlchemy init
│   └── jsearch.py  # JSearch API client (RapidAPI wrapper)
├── frontend/       # React app (Create React App or Vite)
│   ├── src/
│   │   ├── api/        # Axios service layer talking to Flask
│   │   ├── components/ # JobCard, FilterBar, BookmarkList, StatusBadge
│   │   └── App.jsx
│   └── package.json
├── .env            # RAPIDAPI_KEY, FLASK_SECRET_KEY (never committed)
└── .env.example
```

**Data flow:** React → Flask REST API → JSearch API (for search) or SQLite (for bookmarks/status).

**Application status tracking:** Jobs can be marked as `saved`, `applied`, `interviewing`, `offer`, or `rejected` — stored in SQLite, updated via PATCH endpoints.

## Environment Setup

Copy `.env.example` to `.env` and fill in your RapidAPI key:
```
RAPIDAPI_KEY=your_rapidapi_key_here
FLASK_ENV=development
FLASK_SECRET_KEY=some_random_string
```

## Backend Commands

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
flask run                        # starts on http://localhost:5000
python -m pytest                 # run tests
python -m pytest tests/test_jobs.py  # run a single test file
```

## Frontend Commands

```bash
cd frontend
npm install
npm start                        # dev server on http://localhost:3000
npm run build                    # production build
npm test                         # run tests
```

## Key API Endpoints (Flask)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/jobs/search` | Search jobs via JSearch; accepts query params: `query`, `location`, `remote`, `salary_min`, `employment_type`, `page` |
| GET | `/api/bookmarks` | List all saved jobs |
| POST | `/api/bookmarks` | Save a job |
| DELETE | `/api/bookmarks/<id>` | Remove a saved job |
| PATCH | `/api/bookmarks/<id>/status` | Update application status |

## JSearch Integration

`backend/jsearch.py` wraps the RapidAPI JSearch endpoint. The `RAPIDAPI_KEY` is loaded from the environment — never hardcoded. All external API calls go through this module so the rest of the app stays decoupled from the third-party API shape.

## Frontend ↔ Backend Communication

The React app targets `http://localhost:5000` in development. Configure this via a proxy in `frontend/package.json`:
```json
"proxy": "http://localhost:5000"
```
All fetch/axios calls in `src/api/` use relative paths (e.g., `/api/jobs/search`) so they work in both dev (proxied) and production (same origin).
