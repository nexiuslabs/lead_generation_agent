-- Create summaries table for deterministic crawler results
CREATE TABLE IF NOT EXISTS summaries (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES companies(company_id),
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  content_summary TEXT,
  key_pages JSONB,
  signals JSONB,
  rule_score INT,
  rule_band TEXT,
  shortlist JSONB,
  crawl_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_summaries_company ON summaries(company_id);
