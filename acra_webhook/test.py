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

# Configuration from environment variables (no hard-coded secrets)
DATABASE_URL = os.getenv("DATABASE_URL")
API_URL = os.getenv("API_URL", "")
RESOURCE_ID = os.getenv("RESOURCE_ID", "")
try:
    PAGE_SIZE = int(os.getenv("PAGE_SIZE", "100"))
except ValueError:
    PAGE_SIZE = 100

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
    """Fetch only first PAGE_SIZE Live records at startup."""
    print(f"[{datetime.now()}] Starting one-page ingestion of Live companies")
    params = {
        "resource_id": RESOURCE_ID,
        "limit": PAGE_SIZE,
        "offset": 0,
        "filters": json.dumps({"entity_status_description": "Live"}),
    }
    resp = requests.get(API_URL, params=params, timeout=30)
    resp.raise_for_status()
    recs = resp.json().get("result", {}).get("records", [])
    upsert_to_staging(recs)
    print(f"[{datetime.now()}] Completed one-page ingestion: {len(recs)} records upserted")

def scheduled_ingestion():  # full job for scheduler
    """Full ingestion job for scheduler."""
    print(f"[{datetime.now()}] Starting full ingestion job")
    records = fetch_all_acra()
    upsert_to_staging(records)
    print(f"[{datetime.now()}] Completed full ingestion: {len(records)} records upserted")

# Configure the scheduler for nightly runs at midnight
scheduler = AsyncIOScheduler(timezone="Asia/Bangkok")
scheduler.add_job(scheduled_ingestion, CronTrigger(hour=0, minute=0))
# Only start the scheduler when an asyncio loop is running (e.g., under uvicorn)
try:
    asyncio.get_running_loop()
    scheduler.start()
except RuntimeError:
    print("[scheduler] No running event loop; skipping start in script mode")

@app.on_event("startup")
async def startup_event():
    # only pull the first batch of 1 000 on startup
    fetch_one_batch()

@app.get("/health")
def health_check():
    return {"status": "ok"}
