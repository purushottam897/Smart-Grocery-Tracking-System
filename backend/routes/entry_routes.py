from flask import Blueprint, jsonify, request

from models.entry_model import create_entry, get_entries_by_seller_id, get_last_entry_for_seller
from models.seller_model import get_seller_by_id
from services.backup import save_to_google_sheet, send_email_notification

entry_bp = Blueprint("entry_bp", __name__)


@entry_bp.post("/add-entry")
def add_entry():
    data = request.get_json() or {}
    seller_id = data.get("seller_id")
    bags = data.get("bags")
    weight_per_bag = data.get("weight_per_bag")

    if not seller_id or bags is None or weight_per_bag is None:
        return jsonify({"error": "seller_id, bags, and weight_per_bag are required"}), 400

    seller = get_seller_by_id(seller_id)
    if not seller:
        return jsonify({"error": "Seller not found"}), 404

    try:
        bags = int(bags)
        weight_per_bag = float(weight_per_bag)
    except (TypeError, ValueError):
        return jsonify({"error": "bags must be an integer and weight_per_bag must be a number"}), 400

    if bags <= 0 or weight_per_bag <= 0:
        return jsonify({"error": "bags and weight_per_bag must be greater than zero"}), 400

    entry = create_entry(seller_id, bags, weight_per_bag)
    backup_data = {
        "person_name": seller["person_name"],
        "product": seller["product"],
        "village": seller["village"],
        "bags": entry["bags"],
        "weight_per_bag": float(entry["weight_per_bag"]),
        "total_kg": float(entry["total_kg"]),
        "date": str(entry["date"]),
    }

    try:
        save_to_google_sheet(backup_data)
    except Exception as exc:
        print(f"Google Sheets backup failed: {exc}")

    try:
        send_email_notification(backup_data)
    except Exception as exc:
        print(f"Gmail notification skipped or failed: {exc}")

    return jsonify(entry), 201


@entry_bp.get("/entries/<int:seller_id>")
def get_entries(seller_id):
    seller = get_seller_by_id(seller_id)
    if not seller:
        return jsonify({"error": "Seller not found"}), 404

    data = get_entries_by_seller_id(seller_id)
    data["last_entry"] = get_last_entry_for_seller(seller_id)
    return jsonify(data)
