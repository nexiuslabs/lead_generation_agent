Agents Guide — acra_webhook

Purpose
- Ingest “Live” company records from ACRA API into staging_acra_companies with upserts by UEN.

Setup
- python -m venv .venv && source .venv/bin/activate
- pip install -r requirements.txt (if present) or pip install fastapi uvicorn apscheduler sqlalchemy requests python-dotenv
- .env:
  - DATABASE_URL=postgresql://user:pass@host:port/db
  - API_URL=https://data.gov.sg/api/action/datastore_search
  - RESOURCE_ID=<acra_resource_id>
  - PAGE_SIZE=100
  - DISABLE_SCHEDULER=0  # set 1 to disable cron
  - TEST_PAGE_BY_PAGE=0  # set 1 + INTERVAL_SECONDS to page slowly

Run
- uvicorn main:app --host 0.0.0.0 --port 8081
- Health: GET /health

Scheduler
- Default cron: daily 01:22 Asia/Bangkok (full ingestion).
- TEST_PAGE_BY_PAGE=1 to fetch one page per interval (INTERVAL_SECONDS) for testing.

Notes
- Only “Live” entities are upserted; extra JSON fields dropped.
- Idempotent upsert on uen; conflicting fields updated.

Troubleshooting
- HTTP errors: verify API_URL/RESOURCE_ID.
- DB errors: confirm DATABASE_URL and table staging_acra_companies exists (in schema_PosgresDB.sql).

