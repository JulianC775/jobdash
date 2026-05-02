import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from db import init_db
from routes.jobs import jobs_bp
from routes.bookmarks import bookmarks_bp


def create_app(test_config=None):
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY", "dev")
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        test_config.get("DATABASE_URI")
        if test_config
        else os.environ.get("DATABASE_URL", "sqlite:///jobdash.db")
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    init_db(app)

    app.register_blueprint(jobs_bp)
    app.register_blueprint(bookmarks_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=os.environ.get("FLASK_ENV") == "development")
