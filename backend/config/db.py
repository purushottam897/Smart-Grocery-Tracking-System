import os

import mysql.connector
from mysql.connector import Error


def get_env_value(*keys, default=None, allow_empty=False):
    for key in keys:
        if key in os.environ:
            value = os.environ.get(key)
            if value == "" and not allow_empty:
                continue
            return value
    return default


def get_db_config():
    host = get_env_value("DB_HOST", "MYSQL_HOST", default="localhost")
    user = get_env_value("DB_USER", "MYSQL_USER", default="root")
    password = get_env_value("DB_PASS", "MYSQL_PASSWORD", default="password", allow_empty=True)
    database = get_env_value("DB_NAME", "MYSQL_DATABASE", default="grocery_db")
    port = get_env_value("DB_PORT", "MYSQL_PORT", default="3306")

    return {
        "host": host,
        "user": user,
        "password": password,
        "database": database,
        "port": int(port),
    }


def get_db_debug_summary():
    config = get_db_config()
    password = config.get("password", "")
    return {
        "host": config["host"],
        "port": config["port"],
        "user": config["user"],
        "database": config["database"],
        "password_set": password != "",
        "password_length": len(password),
    }


def get_connection():
    return mysql.connector.connect(**get_db_config())


def get_server_connection():
    config = get_db_config().copy()
    config.pop("database", None)
    return mysql.connector.connect(**config)


def ensure_database_exists():
    config = get_db_config()
    database_name = config["database"]
    connection = None
    cursor = None

    try:
        connection = get_server_connection()
        cursor = connection.cursor()
        cursor.execute("SHOW DATABASES LIKE %s", (database_name,))
        database_exists = cursor.fetchone() is not None

        if database_exists:
            print("Database already exists")
            return

        cursor.execute(f"CREATE DATABASE `{database_name}`")
        connection.commit()
        print("Database created")
    except Error as exc:
        raise RuntimeError(
            "Failed to verify or create the MySQL database. "
            f"host={config['host']} port={config['port']} user={config['user']} "
            f"database={database_name}. Original error: {exc}"
        ) from exc
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def create_tables(connection):
    cursor = None
    try:
        cursor = connection.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS sellers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                person_name VARCHAR(255) NOT NULL,
                product VARCHAR(255) NOT NULL,
                village VARCHAR(255) NOT NULL
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS entries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                seller_id INT NOT NULL,
                bags INT NOT NULL,
                weight_per_bag FLOAT NOT NULL,
                total_kg FLOAT NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
            )
            """
        )
        connection.commit()
        print("Tables created")
    except Error as exc:
        raise RuntimeError(f"Failed to create tables: {exc}") from exc
    finally:
        if cursor:
            cursor.close()


def init_db():
    config = get_db_config()
    ensure_database_exists()
    connection = None

    try:
        connection = get_connection()
        create_tables(connection)
    except Error as exc:
        raise RuntimeError(
            "MySQL connection failed during database initialization. "
            f"host={config['host']} port={config['port']} user={config['user']} "
            f"database={config['database']}. Original error: {exc}"
        ) from exc
    finally:
        if connection and connection.is_connected():
            connection.close()
