import os

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from config.db import get_db_debug_summary, init_db
from routes.dashboard_routes import dashboard_bp
from routes.entry_routes import entry_bp
from routes.seller_routes import seller_bp

load_dotenv()


def normalize_origin(origin):
    return origin.strip().rstrip("/")


def get_cors_origins():
    origins = os.getenv("CORS_ORIGINS", "*").strip()
    if origins == "*":
        return "*"
    return [normalize_origin(origin) for origin in origins.split(",") if origin.strip()]


def create_app():
    app = Flask(__name__)
    app.config["JSON_SORT_KEYS"] = False
    cors_origins = get_cors_origins()
    CORS(
        app,
        resources={
            r"/*": {
                "origins": cors_origins,
                "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        },
    )

    try:
        db_summary = get_db_debug_summary()
        print(
            "Starting Smart Grocery Tracking System backend with DB config:",
            f"host={db_summary['host']}",
            f"port={db_summary['port']}",
            f"user={db_summary['user']}",
            f"database={db_summary['database']}",
            f"password_set={db_summary['password_set']}",
            f"cors_origins={cors_origins}",
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
