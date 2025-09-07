from fastapi import FastAPI
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import create_engine, text
import requests
import json
import os
from datetime import datetime
import asyncio
from dotenv import load_dotenv

# Load environment from a local .env if present
load_dotenv()

# Configuration from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
API_URL = os.getenv("API_URL")
RESOURCE_ID = os.getenv("RESOURCE_ID")
try:
    PAGE_SIZE = int(os.getenv("PAGE_SIZE", "100"))
except ValueError:
    PAGE_SIZE = 100

# Initialize FastAPI app
app = FastAPI()

# Initialize lazy DB engine
engine = None

def get_engine():
    global engine
    if engine is None:
        if not DATABASE_URL:
            raise RuntimeError(
                "DATABASE_URL is not set. Set it or run with DISABLE_STARTUP_INGEST=1 DISABLE_SCHEDULER=1 to boot without ingestion."
            )
        engine = create_engine(DATABASE_URL)
    return engine


def _ingestion_config_ok():
    missing = []
    if not API_URL:
        missing.append("API_URL")
    if not RESOURCE_ID:
        missing.append("RESOURCE_ID")
    return (len(missing) == 0, missing)

# Only these columns will be upserted; extraneous fields like '_id' are dropped
ALLOWED_COLUMNS = [
    "uen",
    "issuance_agency_id",
    "entity_name",
    "entity_type_description",
    "business_constitution_description",
    "company_type_description",
    "paf_constitution_description",
    "entity_status_description",
    "registration_incorporation_date",
    "uen_issue_date",
    "address_type",
    "block",
    "street_name",
    "level_no",
    "unit_no",
    "building_name",
    "postal_code",
    "other_address_line1",
    "other_address_line2",
    "account_due_date",
    "annual_return_date",
    "primary_ssic_code",
    "primary_ssic_description",
    "primary_user_described_activity",
    "secondary_ssic_code",
    "secondary_ssic_description",
    "secondary_user_described_activity",
    "no_of_officers",
    "former_entity_name1",
    "former_entity_name2",
    "former_entity_name3",
    "former_entity_name4",
    "former_entity_name5",
    "former_entity_name6",
    "former_entity_name7",
    "former_entity_name8",
    "former_entity_name9",
    "former_entity_name10",
    "former_entity_name11",
    "former_entity_name12",
    "former_entity_name13",
    "former_entity_name14",
    "former_entity_name15",
    "uen_of_audit_firm1",
    "name_of_audit_firm1",
    "uen_of_audit_firm2",
    "name_of_audit_firm2",
    "uen_of_audit_firm3",
    "name_of_audit_firm3",
    "uen_of_audit_firm4",
    "name_of_audit_firm4",
    "uen_of_audit_firm5",
    "name_of_audit_firm5",
]

def fetch_all_acra():
    offset = 0
    all_records = []
    while True:
        params = {
            "resource_id": RESOURCE_ID,
            "limit": PAGE_SIZE,
            "offset": offset,
            "filters": json.dumps({"entity_status_description": "Live"}),
        }
        response = requests.get(API_URL, params=params, timeout=30)
        response.raise_for_status()
        recs = response.json().get("result", {}).get("records", [])
        if not recs:
            break
        all_records.extend(recs)
        offset += len(recs)
    return all_records

def upsert_to_staging(records):
    with get_engine().begin() as conn:
        for rec in records:
            # Only upsert companies with 'Live' status
            if rec.get("entity_status_description") != "Live":
                continue
            data = {col: rec.get(col) for col in ALLOWED_COLUMNS}
            conn.execute(
                text(
                    """
                INSERT INTO staging_acra_companies (
                    uen,
                    issuance_agency_id,
                    entity_name,
                    entity_type_description,
                    business_constitution_description,
                    company_type_description,
                    paf_constitution_description,
                    entity_status_description,
                    registration_incorporation_date,
                    uen_issue_date,
                    address_type,
                    block,
                    street_name,
                    level_no,
                    unit_no,
                    building_name,
                    postal_code,
                    other_address_line1,
                    other_address_line2,
                    account_due_date,
                    annual_return_date,
                    primary_ssic_code,
                    primary_ssic_description,
                    primary_user_described_activity,
                    secondary_ssic_code,
                    secondary_ssic_description,
                    secondary_user_described_activity,
                    no_of_officers,
                    former_entity_name1,
                    former_entity_name2,
                    former_entity_name3,
                    former_entity_name4,
                    former_entity_name5,
                    former_entity_name6,
                    former_entity_name7,
                    former_entity_name8,
                    former_entity_name9,
                    former_entity_name10,
                    former_entity_name11,
                    former_entity_name12,
                    former_entity_name13,
                    former_entity_name14,
                    former_entity_name15,
                    uen_of_audit_firm1,
                    name_of_audit_firm1,
                    uen_of_audit_firm2,
                    name_of_audit_firm2,
                    uen_of_audit_firm3,
                    name_of_audit_firm3,
                    uen_of_audit_firm4,
                    name_of_audit_firm4,
                    uen_of_audit_firm5,
                    name_of_audit_firm5
                ) VALUES (
                    :uen,
                    :issuance_agency_id,
                    :entity_name,
                    :entity_type_description,
                    :business_constitution_description,
                    :company_type_description,
                    :paf_constitution_description,
                    :entity_status_description,
                    :registration_incorporation_date,
                    :uen_issue_date,
                    :address_type,
                    :block,
                    :street_name,
                    :level_no,
                    :unit_no,
                    :building_name,
                    :postal_code,
                    :other_address_line1,
                    :other_address_line2,
                    :account_due_date,
                    :annual_return_date,
                    :primary_ssic_code,
                    :primary_ssic_description,
                    :primary_user_described_activity,
                    :secondary_ssic_code,
                    :secondary_ssic_description,
                    :secondary_user_described_activity,
                    :no_of_officers,
                    :former_entity_name1,
                    :former_entity_name2,
                    :former_entity_name3,
                    :former_entity_name4,
                    :former_entity_name5,
                    :former_entity_name6,
                    :former_entity_name7,
                    :former_entity_name8,
                    :former_entity_name9,
                    :former_entity_name10,
                    :former_entity_name11,
                    :former_entity_name12,
                    :former_entity_name13,
                    :former_entity_name14,
                    :former_entity_name15,
                    :uen_of_audit_firm1,
                    :name_of_audit_firm1,
                    :uen_of_audit_firm2,
                    :name_of_audit_firm2,
                    :uen_of_audit_firm3,
                    :name_of_audit_firm3,
                    :uen_of_audit_firm4,
                    :name_of_audit_firm4,
                    :uen_of_audit_firm5,
                    :name_of_audit_firm5
                )
                ON CONFLICT (uen) DO UPDATE SET
                    entity_name = EXCLUDED.entity_name,
                    entity_type_description = EXCLUDED.entity_type_description,
                    registration_incorporation_date = EXCLUDED.registration_incorporation_date,
                    uen_issue_date = EXCLUDED.uen_issue_date
            """
                ),
                data,
            )

def scheduled_ingestion():
    ok, missing = _ingestion_config_ok()
    if not ok:
        print(
            f"[{datetime.now()}] Skipping ACRA ingestion job; missing config: {', '.join(missing)}"
        )
        return
    print(f"[{datetime.now()}] Starting ACRA ingestion job")
    try:
        records = fetch_all_acra()
        try:
            upsert_to_staging(records)
            print(
                f"[{datetime.now()}] Completed ACRA ingestion job: {len(records)} records upserted"
            )
        except Exception as db_err:
            print(
                f"[{datetime.now()}] ACRA ingestion skipped due to DB error: {db_err}"
            )
    except Exception as http_err:
        print(f"[{datetime.now()}] ACRA ingestion HTTP error: {http_err}")

# Configure the scheduler
scheduler = AsyncIOScheduler(timezone="Asia/Bangkok")
# Schedule the job to run daily at 00:00 (midnight)
scheduler.add_job(scheduled_ingestion, CronTrigger(hour=0, minute=0))

# Start scheduler only when allowed and an event loop is present
if os.getenv("DISABLE_SCHEDULER", "0") == "1":
    print("[scheduler] Disabled by env (DISABLE_SCHEDULER=1)")
else:
    try:
        asyncio.get_running_loop()
        scheduler.start()
    except RuntimeError:
        print("[scheduler] No running event loop; skipping start")

@app.on_event("startup")
async def startup_event():
    # Optionally run immediately on startup
    if os.getenv("DISABLE_STARTUP_INGEST", "0") == "1":
        print("[startup] Startup ingestion disabled by env")
        return
    scheduled_ingestion()

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# To run:
# uvicorn app:app --host 0.0.0.0 --port 8000
