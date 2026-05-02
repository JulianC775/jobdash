import os
import requests

JSEARCH_BASE = "https://jsearch.p.rapidapi.com"


def _headers():
    return {
        "X-RapidAPI-Key": os.environ["RAPIDAPI_KEY"],
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    }


def search_jobs(query, location="", remote_only=False, employment_type="",
                salary_min=None, page=1, num_pages=1):
    params = {
        "query": f"{query} {location}".strip(),
        "page": str(page),
        "num_pages": str(num_pages),
    }
    if remote_only:
        params["remote_jobs_only"] = "true"
    if employment_type:
        params["employment_types"] = employment_type.upper()

    resp = requests.get(
        f"{JSEARCH_BASE}/search",
        headers=_headers(),
        params=params,
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()

    jobs = [_normalize(j) for j in data.get("data", [])]

    if salary_min:
        jobs = [j for j in jobs if _meets_salary(j, salary_min)]

    return jobs


def _normalize(raw):
    return {
        "job_id": raw.get("job_id"),
        "title": raw.get("job_title"),
        "company": raw.get("employer_name"),
        "location": f"{raw.get('job_city', '')}, {raw.get('job_state', '')}".strip(", "),
        "country": raw.get("job_country"),
        "is_remote": raw.get("job_is_remote", False),
        "employment_type": raw.get("job_employment_type"),
        "salary_min": raw.get("job_min_salary"),
        "salary_max": raw.get("job_max_salary"),
        "salary_currency": raw.get("job_salary_currency"),
        "salary_period": raw.get("job_salary_period"),
        "apply_link": raw.get("job_apply_link"),
        "description": raw.get("job_description", "")[:1000],
        "posted_at": raw.get("job_posted_at_datetime_utc"),
        "employer_logo": raw.get("employer_logo"),
    }


def _meets_salary(job, salary_min):
    low = job.get("salary_min")
    high = job.get("salary_max")
    if low is not None:
        return low >= salary_min
    if high is not None:
        return high >= salary_min
    return True
