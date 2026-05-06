from datetime import datetime
from db import db

VALID_STATUSES = {"saved", "applied", "interviewing", "offer", "rejected"}


class Bookmark(db.Model):
    __tablename__ = "bookmarks"

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.String(255), unique=True, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    company = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255))
    salary_min = db.Column(db.Float)
    salary_max = db.Column(db.Float)
    salary_currency = db.Column(db.String(10))
    employment_type = db.Column(db.String(50))
    is_remote = db.Column(db.Boolean, default=False)
    apply_link = db.Column(db.Text)
    description = db.Column(db.Text)
    status = db.Column(db.String(50), default="saved")
    notes = db.Column(db.Text, default="")
    employer_logo = db.Column(db.Text)
    saved_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "job_id": self.job_id,
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "salary_min": self.salary_min,
            "salary_max": self.salary_max,
            "salary_currency": self.salary_currency,
            "employment_type": self.employment_type,
            "is_remote": self.is_remote,
            "apply_link": self.apply_link,
            "description": self.description,
            "employer_logo": self.employer_logo,
            "status": self.status,
            "notes": self.notes or "",
            "saved_at": self.saved_at.isoformat(),
        }
