**TODO — Dev Plan 14: Acceptance Criteria (Pre‑SDR)**

Source: featurePRD14.md and featureDevPlan14.md

Legend
- [ ] Pending
- [~] In progress
- [x] Done
- [!] Blocked / Needs decision

## Metrics & API
- [x] Add `GET /acceptance/report` endpoint in `app/main.py`
- [x] Implement SQL queries for: MV candidates, shortlisted count, domain/about/email rates, bucket counts, rationale rate
- [ ] (Optional) Add `rationale_cache` table and integrate in `lead_scoring.py`

## CLI & Automation
- [x] Create `scripts/acceptance_check.py` (asyncpg) to validate thresholds and exit non‑zero on failure
- [x] Add Makefile or npm script alias to run acceptance check
- [ ] Wire acceptance check in staging nightly cron/CI

## SSO & Isolation Tests
- [x] Add small script/docs to verify `/info` 401 without cookies and 200 with cookies
- [x] RLS smoke tests using `DEFAULT_TENANT_ID` for A vs B scoping

## UX & Exports
- [ ] Verify chat streaming, error toasts, and command flows
- [x] Verify export buttons (CSV/JSON) deliver files; content matches DB rows (script provided)

## Odoo Readiness
- [x] Measure `/onboarding/verify_odoo` p95 ≤ 60s on staging for new tenants (script provided)
- [ ] Document remediation for common failures

## Observability & Alerts
- [~] Ensure dashboards include counts, durations, error rates, vendor usage, token spend (Feature 8 SQL stubs present)
- [ ] Ensure alerts configured: MV refresh failure, high error rate, quotas, OpenAI 429s, low candidates

## Pilot Exit
- [ ] Run nightly across two tenants and collect three consecutive passes
- [ ] Archive acceptance reports (JSON/CSV) and dashboard snapshots
- [ ] Confirm cost within PRD 10 budgets and no P1 incidents open
