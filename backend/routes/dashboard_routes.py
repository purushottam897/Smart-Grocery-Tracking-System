from flask import Blueprint, request

from models.dashboard_model import get_dashboard_stats

dashboard_bp = Blueprint("dashboard_bp", __name__)


@dashboard_bp.get("/dashboard")
def dashboard():
    period = request.args.get("period", "today").strip().lower()
    return get_dashboard_stats(period)
