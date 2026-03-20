import os
import smtplib
from email.message import EmailMessage
from pathlib import Path

try:
    import gspread
    from oauth2client.service_account import ServiceAccountCredentials
except ImportError:
    gspread = None
    ServiceAccountCredentials = None


BASE_DIR = Path(__file__).resolve().parent.parent
GOOGLE_SHEET_NAME = os.getenv("GOOGLE_SHEET_NAME", "GroceryData")


def get_google_credentials_path():
    """Return the Google service account credentials path from environment."""
    credentials_path = os.getenv("GOOGLE_CREDENTIALS_PATH")
    if not credentials_path:
        raise RuntimeError(
            "Missing GOOGLE_CREDENTIALS_PATH environment variable for Google Sheets backup."
        )

    resolved_path = Path(credentials_path)
    if not resolved_path.is_absolute():
        resolved_path = BASE_DIR / resolved_path

    if not resolved_path.exists():
        raise RuntimeError(
            f"Google credentials file not found at: {resolved_path}"
        )

    return resolved_path


def save_to_google_sheet(data):
    """Append a single row to the configured Google Sheet backup."""
    if gspread is None or ServiceAccountCredentials is None:
        raise RuntimeError(
            "Google Sheets backup is unavailable because gspread/oauth2client is not installed."
        )

    scope = [
        "https://spreadsheets.google.com/feeds",
        "https://www.googleapis.com/auth/drive",
    ]
    credentials_path = get_google_credentials_path()

    credentials = ServiceAccountCredentials.from_json_keyfile_name(
        str(credentials_path),
        scope,
    )
    try:
        client = gspread.authorize(credentials)
        sheet = client.open(GOOGLE_SHEET_NAME).sheet1
        sheet.append_row(
            [
                data["person_name"],
                data["product"],
                data["village"],
                data["bags"],
                data["weight_per_bag"],
                data["total_kg"],
                data["date"],
            ]
        )
    except Exception as exc:
        raise RuntimeError(f"Google Sheets backup failed: {exc}") from exc


def send_email_notification(data):
    """Send a Gmail notification containing the saved entry details."""
    sender_email = os.getenv("GMAIL_SENDER")
    sender_password = os.getenv("GMAIL_APP_PASSWORD")
    recipient_email = os.getenv("GMAIL_RECIPIENT", sender_email)

    if not sender_email or not sender_password or not recipient_email:
        raise RuntimeError(
            "Missing Gmail configuration. Set GMAIL_SENDER, GMAIL_APP_PASSWORD, and GMAIL_RECIPIENT."
        )

    message = EmailMessage()
    message["Subject"] = "Smart Grocery Tracking Backup"
    message["From"] = sender_email
    message["To"] = recipient_email
    message.set_content(
        "\n".join(
            [
                "A new grocery entry was added:",
                "",
                f"Person Name: {data['person_name']}",
                f"Product: {data['product']}",
                f"Village: {data['village']}",
                f"Bags: {data['bags']}",
                f"Weight per Bag: {data['weight_per_bag']}",
                f"Total KG: {data['total_kg']}",
                f"Date: {data['date']}",
            ]
        )
    )

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(message)
