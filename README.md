# Smart Grocery Tracking System

Smart Grocery Tracking System is a full-stack web app for tracking grocery purchases from reusable farmer profiles. It includes a React frontend, a Flask REST API, MySQL persistence, dashboard analytics, English/Telugu language switching, and backup integrations.

## Features

- Farmer-based workflow with reusable profiles
- Fast entry form with auto-calculated total kg
- Repeat last entry for minimal typing
- Farmer search by person, product, or village
- Dashboard totals for today, week, and month
- Village-wise grouping and top-farmer insights
- English and Telugu JSON-based translations
- Mobile-friendly UI with large inputs and buttons
- Google Sheets backup for every new entry
- Optional Gmail notification backup

## Project Structure

```text
backend/
  app.py
  Procfile
  config/
  models/
  routes/
  services/
frontend/
  .env.example
  vercel.json
  src/
    components/
    pages/
    i18n/
```

## Backend Setup

1. Install MySQL and create a user that can create databases.
2. Copy `backend/.env.example` to `backend/.env` and update the values.
3. Create and activate a virtual environment.
4. Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

5. Start the Flask server:

```bash
python app.py
```

The API will run on `http://127.0.0.1:8082`.

### Google Sheets Backup Setup

1. Enable both the Google Sheets API and Google Drive API in your Google Cloud project.
2. Create a service account and download the JSON credentials file.
3. Place that file at `backend/credentials.json`, or change `GOOGLE_CREDENTIALS_PATH` in `backend/.env`.
4. Create a Google Sheet named `GroceryData`.
5. Share the sheet with the service account email found in the JSON file.

### Gmail Notification Setup

1. Turn on 2-Step Verification for your Gmail account.
2. Generate a Gmail App Password.
3. Add `GMAIL_SENDER`, `GMAIL_APP_PASSWORD`, and `GMAIL_RECIPIENT` to `backend/.env`.
4. The email step is optional. If it fails, MySQL save will still succeed.

## Frontend Setup

1. Install Node.js 18+.
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Start the frontend:

```bash
npm run dev
```

The frontend will run on `http://127.0.0.1:5173`.

Set `frontend/.env` to point to your backend:

```env
VITE_API_URL=http://127.0.0.1:8082
```

## API Endpoints

- `POST /add-seller`
- `GET /sellers`
- `GET /sellers/<seller_id>`
- `POST /add-entry`
- `GET /entries/<seller_id>`
- `GET /dashboard?period=today|week|month`

## Notes

- The backend auto-creates the database and required tables on startup.
- CORS is enabled and can be controlled with `CORS_ORIGINS`.
- Translation files are stored in `frontend/src/i18n/en.json` and `frontend/src/i18n/te.json`.
- Google Sheets and Gmail backup logic lives in `backend/services/backup.py`.
- For Render, set the service root to `backend`.
- For Vercel, set the project root to `frontend`.
