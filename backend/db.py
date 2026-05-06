from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

db = SQLAlchemy()

_NEW_COLUMNS = [
    "ALTER TABLE bookmarks ADD COLUMN notes TEXT DEFAULT ''",
    "ALTER TABLE bookmarks ADD COLUMN employer_logo TEXT",
]


def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
        _migrate(app)


def _migrate(app):
    """Add any columns that don't exist yet (idempotent)."""
    with app.app_context():
        with db.engine.connect() as conn:
            for stmt in _NEW_COLUMNS:
                try:
                    conn.execute(text(stmt))
                    conn.commit()
                except Exception:
                    pass  # column already exists
