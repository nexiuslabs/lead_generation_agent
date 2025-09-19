**TODO — Dev Plan 16: Apify LinkedIn Fallback**

Source: featurePRD16.md and featureDevPlan16.md

Legend
- [ ] Pending
- [~] In progress
- [x] Done
- [!] Blocked / Needs decision

## Configuration & Flags
- [x] Add envs: `APIFY_TOKEN`, `APIFY_LINKEDIN_ACTOR_ID`, `APIFY_SYNC_TIMEOUT_S`, `APIFY_DATASET_FORMAT`, `APIFY_DAILY_CAP`
- [x] Feature flags: `ENABLE_APIFY_LINKEDIN=true`, `ENABLE_LUSHA_FALLBACK=false`
- [~] Tenant titles: read from `icp_rules.payload.preferred_titles` with fallback `CONTACT_TITLES` (fallback env wired; per-tenant titles pending)

## Vendor Module
- [x] Create `src/vendors/apify_linkedin.py` with:
  - [x] `run_sync_get_dataset_items(payload, dataset_format, timeout_s)` using httpx
  - [x] `build_queries(company_name, titles)`
  - [x] `normalize_contacts(items)`
- [ ] Unit tests with mocked HTTP responses

## Enrichment Integration
- [x] Add `fetch_contacts_via_apify(company_id, company_name, titles)`
- [x] Upsert normalized rows into `contacts`
- [x] Verify provided emails and upsert into `lead_emails` (ZeroBounce)
- [x] Replace Lusha fallback path with Apify under flag
- [ ] Enforce per-tenant `APIFY_DAILY_CAP` (read from `run_vendor_usage` or local counter)

## Observability & Caps
- [x] Call `obs.bump_vendor(run_id, tenant_id, 'apify_linkedin', calls, errors, cost)`
- [x] Log per-company `run_event_logs` entries for contact discovery
- [~] Add usage to dashboards (Feature 8 SQL: vendor usage by run) (vendor usage table updated; dashboard wiring pending)

## Compliance
- [ ] Document LinkedIn ToS/robots guidelines in runbook
- [ ] Ensure suppression lists/retention apply; no guessed emails

## Testing & Rollout
- [ ] Fault injection: HTTP 429/5xx/timeouts; run continues with degraded reason
- [ ] Staging tenant pilot: measure coverage and cost; tune titles and batch size
- [ ] Enable globally after validation; keep Lusha path off by default
