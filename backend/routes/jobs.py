from flask import Blueprint, jsonify, request
import jsearch

jobs_bp = Blueprint("jobs", __name__, url_prefix="/api/jobs")


@jobs_bp.route("/search")
def search():
    query = request.args.get("query", "").strip()
    if not query:
        return jsonify({"error": "query parameter is required"}), 400

    location = request.args.get("location", "")
    remote = request.args.get("remote", "false").lower() == "true"
    employment_type = request.args.get("employment_type", "")
    page = int(request.args.get("page", 1))

    salary_min = request.args.get("salary_min")
    salary_min = float(salary_min) if salary_min else None

    try:
        results = jsearch.search_jobs(
            query=query,
            location=location,
            remote_only=remote,
            employment_type=employment_type,
            salary_min=salary_min,
            page=page,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 502

    return jsonify({"jobs": results, "count": len(results)})
