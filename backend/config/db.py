import os
from urllib.parse import urlparse

import mysql.connector
from mysql.connector import Error


def _get_env(*keys, default=None):
    for key in keys:
        value = os.getenv(key)
        if value not in (None, ""):
            return str(value).strip().strip("\"'")

    return default


def _is_truthy(value):
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _get_database_url():
    return _get_env("DATABASE_URL", "MYSQL_PUBLIC_URL", "MYSQL_URL")


def _parse_database_url():
    database_url = _get_database_url()
    if not database_url:
        return {}

    parsed = urlparse(database_url)
    if parsed.scheme not in {"mysql", "mysql+pymysql"}:
        return {}

    return {
        "host": parsed.hostname,
        "port": parsed.port or 3306,
        "user": parsed.username,
        "password": parsed.password or "",
        "database": parsed.path.lstrip("/") or None,
    }


def get_db_config():
    url_config = _parse_database_url()
    port = _get_env("DB_PORT", "MYSQL_PORT", "MYSQLPORT", default="3306")

    return {
        "host": _get_env("DB_HOST", "MYSQL_HOST", "MYSQLHOST", default=url_config.get("host")),
        "port": int(_get_env("DB_PORT", "MYSQL_PORT", "MYSQLPORT", default=str(url_config.get("port", port)))),
        "user": _get_env("DB_USER", "MYSQL_USER", "MYSQLUSER", default=url_config.get("user")),
        "password": _get_env(
            "DB_PASS",
            "MYSQL_PASSWORD",
            "MYSQLPASSWORD",
            default=url_config.get("password", ""),
        ),
        "database": _get_env("DB_NAME", "MYSQL_DATABASE", "MYSQLDATABASE", default=url_config.get("database")),
    }


def _get_host_hint(host):
    normalized_host = (host or "").strip().lower()
    if normalized_host.endswith("rlwy.not"):
        return f"Invalid database host '{host}'. Did you mean '{host[:-3]}net'?"

    if " " in normalized_host:
        return f"Invalid database host '{host}'. Remove any spaces from the hostname."

    return None


def validate_db_config(config):
    missing = [key for key in ("host", "user", "database") if not config.get(key)]
    if missing:
        raise RuntimeError(
            "Missing required database environment variables: "
            + ", ".join(f"DB_{key.upper()}" for key in missing)
        )

    host_hint = _get_host_hint(config["host"])
    if host_hint:
        raise RuntimeError(
            f"{host_hint} This app reads DB_HOST/MYSQL_HOST or DATABASE_URL/MYSQL_PUBLIC_URL/MYSQL_URL."
        )

    return {
        "host": config["host"],
        "port": int(config["port"]),
        "user": config["user"],
        "password": config["password"],
        "database": config["database"],
    }


def get_db_debug_summary():
    config = validate_db_config(get_db_config())
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
    return mysql.connector.connect(**validate_db_config(get_db_config()))


def get_server_connection():
    config = validate_db_config(get_db_config()).copy()
    config.pop("database", None)
    return mysql.connector.connect(**config)


def ensure_database_exists():
    config = validate_db_config(get_db_config())
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


def should_attempt_database_create(config):
    if _is_truthy(os.getenv("DB_AUTO_CREATE", "false")):
        return True

    host = (config.get("host") or "").strip().lower()
    return host in {"localhost", "127.0.0.1"}


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
    config = validate_db_config(get_db_config())
    connection = None

    try:
        connection = get_connection()
        create_tables(connection)
    except Error as exc:
        if exc.errno == mysql.connector.errorcode.ER_BAD_DB_ERROR and should_attempt_database_create(config):
            print(
                "Database does not exist yet; attempting creation with current credentials:",
                f"host={config['host']}",
                f"port={config['port']}",
                f"user={config['user']}",
                f"database={config['database']}",
            )
            ensure_database_exists()
            connection = get_connection()
            create_tables(connection)
            return

        raise RuntimeError(
            "MySQL connection failed during database initialization. "
            f"host={config['host']} port={config['port']} user={config['user']} "
            f"database={config['database']}. Original error: {exc}"
        ) from exc
    finally:
        if connection and connection.is_connected():
            connection.close()
