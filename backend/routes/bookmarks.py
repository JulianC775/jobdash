from flask import Blueprint, jsonify, request, abort
from db import db
from models import Bookmark, VALID_STATUSES

bookmarks_bp = Blueprint("bookmarks", __name__, url_prefix="/api/bookmarks")


@bookmarks_bp.route("", methods=["GET"])
def list_bookmarks():
    status_filter = request.args.get("status")
    query = Bookmark.query
    if status_filter:
        query = query.filter_by(status=status_filter)
    bookmarks = query.order_by(Bookmark.saved_at.desc()).all()
    return jsonify({"bookmarks": [b.to_dict() for b in bookmarks]})


@bookmarks_bp.route("", methods=["POST"])
def add_bookmark():
    data = request.get_json(silent=True)
    if not data or not data.get("job_id"):
        return jsonify({"error": "job_id is required"}), 400

    if Bookmark.query.filter_by(job_id=data["job_id"]).first():
        return jsonify({"error": "job already bookmarked"}), 409

    bookmark = Bookmark(
        job_id=data["job_id"],
        title=data.get("title", ""),
        company=data.get("company", ""),
        location=data.get("location"),
        salary_min=data.get("salary_min"),
        salary_max=data.get("salary_max"),
        salary_currency=data.get("salary_currency"),
        employment_type=data.get("employment_type"),
        is_remote=data.get("is_remote", False),
        apply_link=data.get("apply_link"),
        description=data.get("description"),
        employer_logo=data.get("employer_logo"),
        salary_period=data.get("salary_period"),
        posted_at=data.get("posted_at"),
        status="saved",
        notes="",
    )
    db.session.add(bookmark)
    db.session.commit()
    return jsonify(bookmark.to_dict()), 201


@bookmarks_bp.route("/<int:bookmark_id>", methods=["DELETE"])
def delete_bookmark(bookmark_id):
    bookmark = db.session.get(Bookmark, bookmark_id) or abort(404)
    db.session.delete(bookmark)
    db.session.commit()
    return jsonify({"message": "deleted"}), 200


@bookmarks_bp.route("/<int:bookmark_id>/status", methods=["PATCH"])
def update_status(bookmark_id):
    bookmark = db.session.get(Bookmark, bookmark_id) or abort(404)
    data = request.get_json(silent=True)
    new_status = data.get("status") if data else None

    if new_status not in VALID_STATUSES:
        return jsonify({"error": f"status must be one of {sorted(VALID_STATUSES)}"}), 400

    bookmark.status = new_status
    db.session.commit()
    return jsonify(bookmark.to_dict())


@bookmarks_bp.route("/<int:bookmark_id>/notes", methods=["PATCH"])
def update_notes(bookmark_id):
    bookmark = db.session.get(Bookmark, bookmark_id) or abort(404)
    data = request.get_json(silent=True)
    if data is None or "notes" not in data:
        return jsonify({"error": "notes field is required"}), 400

    bookmark.notes = data["notes"]
    db.session.commit()
    return jsonify(bookmark.to_dict())
