from config.db import get_connection


def create_entry(seller_id, bags, weight_per_bag):
    total_kg = round(float(weight_per_bag), 2)
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            INSERT INTO entries (seller_id, bags, weight_per_bag, total_kg)
            VALUES (%s, %s, %s, %s)
            """,
            (seller_id, bags, weight_per_bag, total_kg),
        )
        connection.commit()
        entry_id = cursor.lastrowid
        cursor.execute(
            """
            SELECT id, seller_id, bags, weight_per_bag, total_kg, date
            FROM entries
            WHERE id = %s
            """,
            (entry_id,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()


def get_entries_by_seller_id(seller_id):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT id, seller_id, bags, weight_per_bag, total_kg, date
            FROM entries
            WHERE seller_id = %s
            ORDER BY date DESC, id DESC
            """,
            (seller_id,),
        )
        entries = cursor.fetchall()
        cursor.execute(
            """
            SELECT COALESCE(SUM(total_kg), 0) AS today_total_kg
            FROM entries
            WHERE seller_id = %s AND DATE(date) = CURDATE()
            """,
            (seller_id,),
        )
        today_total_kg = cursor.fetchone()["today_total_kg"]
        return {"entries": entries, "today_total_kg": float(today_total_kg or 0)}
    finally:
        cursor.close()
        connection.close()


def get_last_entry_for_seller(seller_id):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT id, seller_id, bags, weight_per_bag, total_kg, date
            FROM entries
            WHERE seller_id = %s
            ORDER BY date DESC, id DESC
            LIMIT 1
            """,
            (seller_id,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()
