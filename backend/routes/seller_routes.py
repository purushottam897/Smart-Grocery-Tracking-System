from flask import Blueprint, jsonify, request

from models.seller_model import create_seller, get_seller_by_id, get_sellers

seller_bp = Blueprint("seller_bp", __name__)


@seller_bp.post("/add-seller")
def add_seller():
    data = request.get_json() or {}
    person_name = data.get("person_name", "").strip()
    product = data.get("product", "").strip()
    village = data.get("village", "").strip()

    if not person_name or not product or not village:
        return jsonify({"error": "person_name, product, and village are required"}), 400

    seller = create_seller(person_name, product, village)
    return jsonify(seller), 201


@seller_bp.get("/sellers")
def list_sellers():
    search = request.args.get("search", "").strip() or None
    sellers = get_sellers(search)
    return jsonify(sellers)


@seller_bp.get("/sellers/<int:seller_id>")
def seller_detail(seller_id):
    seller = get_seller_by_id(seller_id)
    if not seller:
        return jsonify({"error": "Seller not found"}), 404
    return jsonify(seller)
