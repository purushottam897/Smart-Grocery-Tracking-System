from config.db import get_connection


def create_seller(person_name, product, village):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            INSERT INTO sellers (person_name, product, village)
            VALUES (%s, %s, %s)
            """,
            (person_name, product, village),
        )
        connection.commit()
        seller_id = cursor.lastrowid
        cursor.execute("SELECT * FROM sellers WHERE id = %s", (seller_id,))
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()


def get_sellers(search=None):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        query = """
            SELECT
                s.id,
                s.person_name,
                s.product,
                s.village,
                COALESCE(SUM(CASE WHEN DATE(e.date) = CURDATE() THEN e.total_kg ELSE 0 END), 0) AS today_total_kg,
                MAX(e.date) AS last_entry_at
            FROM sellers s
            LEFT JOIN entries e ON s.id = e.seller_id
        """
        params = []
        if search:
            query += """
                WHERE s.person_name LIKE %s
                OR s.product LIKE %s
                OR s.village LIKE %s
            """
            wildcard = f"%{search}%"
            params.extend([wildcard, wildcard, wildcard])
        query += """
            GROUP BY s.id, s.person_name, s.product, s.village
            ORDER BY s.person_name ASC
        """
        cursor.execute(query, params)
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()


def get_seller_by_id(seller_id):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM sellers WHERE id = %s", (seller_id,))
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()
