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
from dotenv import load_dotenv
load_dotenv()
# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
API_URL = os.getenv("API_URL")
RESOURCE_ID = os.getenv("RESOURCE_ID")
# Ensure PAGE_SIZE is an integer; default to 100 if not set
try:
    PAGE_SIZE = int(os.getenv("PAGE_SIZE", "100"))
except ValueError:
    PAGE_SIZE = 100

# Test mode: ingest a single page every interval
TEST_PAGE_BY_PAGE = os.getenv("TEST_PAGE_BY_PAGE", "0") == "1"
try:
    INTERVAL_SECONDS = int(os.getenv("INTERVAL_SECONDS", "10"))
except ValueError:
    INTERVAL_SECONDS = 10

# Tracks current offset for page-by-page ingestion
CURRENT_OFFSET = 0

# Initialize FastAPI app and lazy DB engine
app = FastAPI()
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
    """Run full pagination loop to fetch all Live companies."""
    offset = 0
    all_records = []
    while True:
        params = {
            "resource_id": RESOURCE_ID,
            "limit": PAGE_SIZE,
            "offset": offset,
            "filters": json.dumps({"entity_status_description": "Live"}),
        }
        resp = requests.get(API_URL, params=params, timeout=30)
        resp.raise_for_status()
        recs = resp.json().get("result", {}).get("records", [])
        if not recs:
            break
        all_records.extend(recs)
        offset += len(recs)
    return all_records


def fetch_page(offset: int):
    """Fetch a single page of 'Live' records starting at given offset."""
    ok, missing = _ingestion_config_ok()
    if not ok:
        print(
            f"[{datetime.now()}] Skipping page fetch; missing config: {', '.join(missing)}"
        )
        return []
    params = {
        "resource_id": RESOURCE_ID,
        "limit": PAGE_SIZE,
        "offset": offset,
        "filters": json.dumps({"entity_status_description": "Live"}),
    }
    resp = requests.get(API_URL, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json().get("result", {}).get("records", [])

def upsert_to_staging(records):
    """Upsert only allowed columns; drop extraneous fields."""
    with get_engine().begin() as conn:
        for rec in records:
            # Only upsert companies with 'Live' status
            if rec.get("entity_status_description") != "Live":
                continue
            # Direct mapping: JSON keys now match database columns
            data = {col: rec.get(col) for col in ALLOWED_COLUMNS}
            conn.execute(text("""
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
                    issuance_agency_id               = EXCLUDED.issuance_agency_id,
                    entity_status_description        = EXCLUDED.entity_status_description,
                    entity_name                      = EXCLUDED.entity_name,
                    entity_type_description          = EXCLUDED.entity_type_description,
                    business_constitution_description= EXCLUDED.business_constitution_description,
                    company_type_description         = EXCLUDED.company_type_description,
                    paf_constitution_description     = EXCLUDED.paf_constitution_description,
                    registration_incorporation_date  = EXCLUDED.registration_incorporation_date,
                    uen_issue_date                   = EXCLUDED.uen_issue_date,
                    address_type                     = EXCLUDED.address_type,
                    block                            = EXCLUDED.block,
                    street_name                      = EXCLUDED.street_name,
                    level_no                         = EXCLUDED.level_no,
                    unit_no                          = EXCLUDED.unit_no,
                    building_name                    = EXCLUDED.building_name,
                    postal_code                      = EXCLUDED.postal_code,
                    account_due_date                 = EXCLUDED.account_due_date,
                    annual_return_date               = EXCLUDED.annual_return_date,
                    primary_ssic_code                = EXCLUDED.primary_ssic_code,
                    primary_ssic_description         = EXCLUDED.primary_ssic_description,
                    secondary_ssic_code              = EXCLUDED.secondary_ssic_code,
                    secondary_ssic_description       = EXCLUDED.secondary_ssic_description,
                    no_of_officers                   = EXCLUDED.no_of_officers
            """),
            data)

def fetch_one_batch():  # on startup
    """Fetch only the first PAGE_SIZE 'Live' records at startup."""
    ok, missing = _ingestion_config_ok()
    if not ok:
        print(
            f"[{datetime.now()}] Skipping one-page ingestion; missing config: {', '.join(missing)}"
        )
        return
    print(f"[{datetime.now()}] Starting one-page ingestion of Live companies")
    try:
        params = {
            "resource_id": RESOURCE_ID,
            "limit": PAGE_SIZE,
            "offset": 0,
            "filters": json.dumps({"entity_status_description": "Live"}),
        }
        resp = requests.get(API_URL, params=params, timeout=30)
        resp.raise_for_status()
        recs = resp.json().get("result", {}).get("records", [])
        try:
            upsert_to_staging(recs)
            print(
                f"[{datetime.now()}] Completed one-page ingestion: {len(recs)} records upserted"
            )
        except Exception as db_err:
            print(
                f"[{datetime.now()}] One-page ingestion skipped due to DB error: {db_err}"
            )
    except Exception as http_err:
        print(f"[{datetime.now()}] One-page ingestion HTTP error: {http_err}")

def scheduled_ingestion():  # full job for scheduler
    """Full ingestion job for scheduler."""
    ok, missing = _ingestion_config_ok()
    if not ok:
        print(
            f"[{datetime.now()}] Skipping scheduled ingestion; missing config: {', '.join(missing)}"
        )
        return
    print(f"[{datetime.now()}] Starting full ingestion job")
    try:
        records = fetch_all_acra()
        try:
            upsert_to_staging(records)
            print(
                f"[{datetime.now()}] Completed full ingestion: {len(records)} records upserted"
            )
        except Exception as db_err:
            print(
                f"[{datetime.now()}] Full ingestion skipped due to DB error: {db_err}"
            )
    except Exception as http_err:
        print(f"[{datetime.now()}] Full ingestion HTTP error: {http_err}")


def paged_ingestion_job():
    """Ingest one page every run, advancing offset; wraps when done."""
    global CURRENT_OFFSET
    ok, missing = _ingestion_config_ok()
    if not ok:
        print(
            f"[{datetime.now()}] Skipping paged ingestion; missing config: {', '.join(missing)}"
        )
        return
    print(
        f"[{datetime.now()}] Paged ingestion starting at offset={CURRENT_OFFSET}, page_size={PAGE_SIZE}"
    )
    try:
        recs = fetch_page(CURRENT_OFFSET)
    except Exception as http_err:
        print(f"[{datetime.now()}] Paged ingestion HTTP error: {http_err}")
        return
    if not recs:
        print(f"[{datetime.now()}] No records; wrapping offset to 0")
        CURRENT_OFFSET = 0
        return
    try:
        upsert_to_staging(recs)
        print(
            f"[{datetime.now()}] Paged ingestion upserted {len(recs)} records (offset={CURRENT_OFFSET})"
        )
    except Exception as db_err:
        print(f"[{datetime.now()}] Paged ingestion DB error: {db_err}")
        return
    CURRENT_OFFSET += len(recs)

# Configure the scheduler for nightly runs at midnight
scheduler = AsyncIOScheduler(timezone="Asia/Bangkok")

def _configure_and_start_scheduler():
    if os.getenv("DISABLE_SCHEDULER", "0") == "1":
        print("[scheduler] Disabled by env (DISABLE_SCHEDULER=1)")
        return
    # Avoid duplicate jobs on reload
    for job in list(scheduler.get_jobs()):
        scheduler.remove_job(job.id)
    if TEST_PAGE_BY_PAGE:
        from apscheduler.triggers.interval import IntervalTrigger

        scheduler.add_job(
            paged_ingestion_job,
            IntervalTrigger(seconds=INTERVAL_SECONDS),
            id="paged_ingest",
            replace_existing=True,
        )
        print(
            f"[scheduler] Configured paged ingestion every {INTERVAL_SECONDS}s, page_size={PAGE_SIZE}"
        )
    else:
        scheduler.add_job(
            scheduled_ingestion, CronTrigger(hour=1, minute=22), id="daily_full", replace_existing=True
        )
        print("[scheduler] Configured daily full ingestion at 01:22 Asia/Bangkok")
    # Start scheduler (safe to call if already running)
    try:
        scheduler.start()
    except Exception:
        pass

@app.on_event("startup")
async def startup_event():
    # only pull the first batch (PAGE_SIZE) on startup unless disabled
    if os.getenv("DISABLE_STARTUP_INGEST", "0") == "1":
        print("[startup] Startup ingestion disabled by env")
    else:
        fetch_one_batch()
    # Configure scheduler after loop is running
    _configure_and_start_scheduler()

@app.get("/health")
def health_check():
    return {"status": "ok"}
