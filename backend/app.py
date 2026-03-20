import os
from pathlib import Path

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from config.db import get_db_debug_summary, init_db
from routes.dashboard_routes import dashboard_bp
from routes.entry_routes import entry_bp
from routes.seller_routes import seller_bp

BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
ENV_EXAMPLE_PATH = BASE_DIR / ".env.example"

ACTIVE_ENV_PATH = ENV_PATH if ENV_PATH.exists() else ENV_EXAMPLE_PATH

load_dotenv(ACTIVE_ENV_PATH)


def get_cors_origins():
    origins = os.getenv("CORS_ORIGINS", "*").strip()
    if origins == "*":
        return "*"
    return [origin.strip() for origin in origins.split(",") if origin.strip()]


def create_app():
    app = Flask(__name__)
    app.config["JSON_SORT_KEYS"] = False
    CORS(app, resources={r"/*": {"origins": get_cors_origins()}})

    try:
        db_summary = get_db_debug_summary()
        print(
            "Starting Smart Grocery Tracking System backend with DB config:",
            f"host={db_summary['host']}",
            f"port={db_summary['port']}",
            f"user={db_summary['user']}",
            f"database={db_summary['database']}",
            f"password_set={db_summary['password_set']}",
            f"env_file={ACTIVE_ENV_PATH}",
        )
        init_db()
    except Exception as exc:
        app.logger.error("Database initialization failed: %s", exc)
        raise

    app.register_blueprint(seller_bp)
    app.register_blueprint(entry_bp)
    app.register_blueprint(dashboard_bp)

    @app.get("/")
    def health_check():
        return {"message": "Smart Grocery Tracking System API is running"}

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8082")))
