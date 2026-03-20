from config.db import get_connection


def get_dashboard_stats(period="today"):
    date_filter = {
        "today": "DATE(e.date) = CURDATE()",
        "week": "YEARWEEK(e.date, 1) = YEARWEEK(CURDATE(), 1)",
        "month": "YEAR(e.date) = YEAR(CURDATE()) AND MONTH(e.date) = MONTH(CURDATE())",
    }.get(period, "DATE(e.date) = CURDATE()")

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            f"""
            SELECT COALESCE(SUM(e.total_kg), 0) AS total_purchased_kg
            FROM entries e
            WHERE {date_filter}
            """
        )
        total_purchased = cursor.fetchone()["total_purchased_kg"]

        cursor.execute(
            f"""
            SELECT s.village, ROUND(SUM(e.total_kg), 2) AS total_kg
            FROM entries e
            INNER JOIN sellers s ON s.id = e.seller_id
            WHERE {date_filter}
            GROUP BY s.village
            ORDER BY total_kg DESC, s.village ASC
            """
        )
        village_totals = cursor.fetchall()

        cursor.execute(
            f"""
            SELECT
                s.id AS seller_id,
                s.person_name,
                s.product,
                s.village,
                ROUND(SUM(e.total_kg), 2) AS total_kg
            FROM entries e
            INNER JOIN sellers s ON s.id = e.seller_id
            WHERE {date_filter}
            GROUP BY s.id, s.person_name, s.product, s.village
            ORDER BY total_kg DESC
            LIMIT 1
            """
        )
        top_seller = cursor.fetchone()

        cursor.execute(
            f"""
            SELECT
                s.person_name,
                ROUND(SUM(e.total_kg), 2) AS total_kg
            FROM entries e
            INNER JOIN sellers s ON s.id = e.seller_id
            WHERE {date_filter}
            GROUP BY s.person_name
            ORDER BY total_kg DESC, s.person_name ASC
            LIMIT 6
            """
        )
        chart_data = cursor.fetchall()

        return {
            "period": period,
            "total_purchased_kg": float(total_purchased or 0),
            "village_totals": village_totals,
            "top_seller": top_seller,
            "chart_data": chart_data,
        }
    finally:
        cursor.close()
        connection.close()
