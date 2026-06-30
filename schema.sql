-- ============================================================
-- PixelWave SmartQuote SaaS Platform — Supabase SQL Schema v2
-- Paste into Supabase SQL Editor → Run All
-- Covers all admin panel modules as of 2026-06-30
-- ============================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fast text search


-- ─── 1. CUSTOMERS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(255) NOT NULL,
  phone        VARCHAR(50),
  email        VARCHAR(255),
  address      TEXT,
  company      VARCHAR(255),
  notes        TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_name  ON customers USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);


-- ─── 2. SUBSCRIPTIONS (Client Portal — Hosting clients) ──────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID REFERENCES customers(id) ON DELETE CASCADE,
  plan_name     VARCHAR(150) NOT NULL,
  monthly_fee   NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status        VARCHAR(20)  NOT NULL DEFAULT 'Active'
                CHECK (status IN ('Active', 'Pending', 'Suspended', 'Cancelled')),
  renewal_date  DATE NOT NULL,
  subdomain     VARCHAR(255),
  company       VARCHAR(255),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status       ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_date ON subscriptions(renewal_date);


-- ─── 3. QUOTATIONS (Transaction Lifecycle) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_no            VARCHAR(60) UNIQUE NOT NULL,
  customer_id         UUID REFERENCES customers(id) ON DELETE SET NULL,
  issue_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  type                VARCHAR(20) NOT NULL DEFAULT 'Quote'
                      CHECK (type IN ('Quote', 'Proforma', 'Agreement', 'Order', 'Invoice')),
  status              VARCHAR(30) NOT NULL DEFAULT 'Draft'
                      CHECK (status IN ('Draft','Sent','Approved','Rejected','Revised',
                                        'Unpaid','Signed','Paid','In Production','Completed')),
  subtotal            NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  discount_percentage NUMERIC(5, 2)  DEFAULT 0.00,
  tax_percentage      NUMERIC(5, 2)  DEFAULT 0.00,
  grand_total         NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  currency            CHAR(3)        DEFAULT 'LKR',
  notes               TEXT,
  terms               TEXT,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotations_type       ON quotations(type);
CREATE INDEX IF NOT EXISTS idx_quotations_status     ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_issue_date ON quotations(issue_date);
CREATE INDEX IF NOT EXISTS idx_quotations_customer   ON quotations(customer_id);


-- ─── 4. QUOTATION LINE ITEMS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotation_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id   UUID REFERENCES quotations(id) ON DELETE CASCADE,
  item_title     VARCHAR(255) NOT NULL,
  description    TEXT,
  quantity       NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price     NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  line_total     NUMERIC(14, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON quotation_items(quotation_id);


-- ─── 5. PRICING MATERIALS (Printing Pricing Calculator) ──────────────────────
CREATE TABLE IF NOT EXISTS pricing_materials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(150) NOT NULL,              -- e.g. 'Box Board (Grey Back)'
  category        VARCHAR(50)  NOT NULL DEFAULT 'board', -- board | paper | fabric | specialty
  gsm             VARCHAR(50),                         -- '350-400 GSM'
  note            TEXT,
  cost_per_sheet  NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing sheet sizes
CREATE TABLE IF NOT EXISTS pricing_sheet_sizes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label       VARCHAR(100) NOT NULL,  -- '30 × 21 inch'
  width_in    NUMERIC(6,2),
  height_in   NUMERIC(6,2),
  area_sqin   NUMERIC(10,2),
  multiplier  NUMERIC(6,4) NOT NULL DEFAULT 1.0,
  note        VARCHAR(100),
  is_active   BOOLEAN DEFAULT TRUE
);

-- Service rate cards
CREATE TABLE IF NOT EXISTS pricing_services (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category   VARCHAR(30) NOT NULL   -- 'board' | 'design' | 'screen' | 'laser' | 'dev'
             CHECK (category IN ('board','design','screen','laser','dev')),
  label      VARCHAR(200) NOT NULL,
  unit       VARCHAR(80)  NOT NULL,
  base_rate  NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ─── 6. KANBAN WORK ORDERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS work_orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
  title        VARCHAR(255) NOT NULL,
  client_name  VARCHAR(255),
  kanban_col   VARCHAR(30) NOT NULL DEFAULT 'todo'
               CHECK (kanban_col IN ('todo','inprogress','review','done')),
  priority     VARCHAR(10) DEFAULT 'normal'
               CHECK (priority IN ('urgent','normal','low')),
  due_date     DATE,
  notes        TEXT,
  assigned_to  VARCHAR(100),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_orders_col      ON work_orders(kanban_col);
CREATE INDEX IF NOT EXISTS idx_work_orders_priority ON work_orders(priority);


-- ─── 7. SUPPLIERS & PURCHASE LOG (Supplier Tracker) ──────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(255) NOT NULL,
  contact    VARCHAR(100),
  category   VARCHAR(100),  -- 'Board & Paper', 'Specialty Paper', 'T-Shirts & Fabric' etc.
  notes      TEXT,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_purchases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id      UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  material         VARCHAR(255) NOT NULL,
  quantity         NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit             VARCHAR(50)  DEFAULT 'Full Sheet',  -- Full Sheet | Units | Kg | Roll | Ream
  unit_cost        NUMERIC(12,2) NOT NULL DEFAULT 0.00, -- what we paid supplier
  client_bill_rate NUMERIC(12,2) NOT NULL DEFAULT 0.00, -- what we charge clients
  purchase_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  notes            TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Computed margin view
CREATE OR REPLACE VIEW supplier_margin_summary AS
SELECT
  s.id,
  s.name       AS supplier_name,
  s.category,
  COUNT(p.id)  AS purchase_count,
  SUM(p.quantity * p.unit_cost)        AS total_cost,
  SUM(p.quantity * p.client_bill_rate) AS total_billed,
  SUM(p.quantity * (p.client_bill_rate - p.unit_cost)) AS gross_margin,
  ROUND(
    SUM(p.quantity * (p.client_bill_rate - p.unit_cost))
    / NULLIF(SUM(p.quantity * p.client_bill_rate), 0) * 100, 2
  ) AS margin_pct
FROM suppliers s
LEFT JOIN supplier_purchases p ON p.supplier_id = s.id
GROUP BY s.id, s.name, s.category;


-- ─── 8. P&L TRACKER ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pnl_expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category     VARCHAR(30) NOT NULL
               CHECK (category IN ('domain','hosting','vps','internet','ads','other')),
  description  VARCHAR(255) NOT NULL,
  amount       NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  expense_month INT  NOT NULL CHECK (expense_month BETWEEN 1 AND 12),
  expense_year  INT  NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INT,
  recurring    BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pnl_revenues (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source        VARCHAR(100) DEFAULT 'Client Invoice',  -- 'Client Invoice' | 'Subscription' | 'Other'
  description   VARCHAR(255),
  amount        NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  revenue_month INT  NOT NULL CHECK (revenue_month BETWEEN 1 AND 12),
  revenue_year  INT  NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INT,
  quotation_id  UUID REFERENCES quotations(id) ON DELETE SET NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly P&L summary view
CREATE OR REPLACE VIEW pnl_monthly_summary AS
SELECT
  COALESCE(r.revenue_year,  e.expense_year)  AS yr,
  COALESCE(r.revenue_month, e.expense_month) AS mo,
  COALESCE(r.total_revenue, 0) AS total_revenue,
  COALESCE(e.total_expenses, 0) AS total_expenses,
  COALESCE(r.total_revenue, 0) - COALESCE(e.total_expenses, 0) AS net_profit
FROM
  (SELECT revenue_year, revenue_month, SUM(amount) AS total_revenue
   FROM pnl_revenues GROUP BY revenue_year, revenue_month) r
FULL OUTER JOIN
  (SELECT expense_year, expense_month, SUM(amount) AS total_expenses
   FROM pnl_expenses GROUP BY expense_year, expense_month) e
ON r.revenue_year = e.expense_year AND r.revenue_month = e.expense_month
ORDER BY yr DESC, mo DESC;


-- ─── 9. OPERATIONS PLANNER TASKS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planner_tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  category    VARCHAR(20) NOT NULL DEFAULT 'ops'
              CHECK (category IN ('ops','analytics','social')),
  day_of_week VARCHAR(10), -- 'Mon','Tue','Wed','Thu','Fri','Sat','Sun'
  week_no     INT,
  year        INT,
  priority    VARCHAR(10) DEFAULT 'normal'
              CHECK (priority IN ('urgent','normal','low')),
  recurring   BOOLEAN DEFAULT FALSE,
  completed   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planner_tasks_week ON planner_tasks(week_no, year);


-- ─── 10. MARKETING CAMPAIGNS (n8n / WhatsApp) ────────────────────────────────
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(255) NOT NULL,
  channel        VARCHAR(30) DEFAULT 'whatsapp'
                 CHECK (channel IN ('whatsapp','email','sms','instagram','facebook')),
  message        TEXT,
  target_segment VARCHAR(100),  -- 'All Subscribers', 'Active Clients', 'Leads' etc.
  status         VARCHAR(20) DEFAULT 'draft'
                 CHECK (status IN ('draft','scheduled','sent','failed')),
  sent_at        TIMESTAMP WITH TIME ZONE,
  sent_count     INT DEFAULT 0,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ─── 11. ACTIVITY LOG (Admin Audit Trail) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action      VARCHAR(100) NOT NULL,  -- 'quote_created', 'status_changed', 'client_added' etc.
  entity_type VARCHAR(50),            -- 'quotation', 'customer', 'subscription' etc.
  entity_id   VARCHAR(100),
  detail      TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);


-- ─── 12. AUTO updated_at TRIGGER ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['customers','subscriptions','quotations','work_orders']
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I;
       CREATE TRIGGER set_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END;
$$;


-- ─── 13. ROW LEVEL SECURITY ──────────────────────────────────────────────────
-- Enable RLS on all tables (Supabase best practice)
ALTER TABLE customers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_materials    ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_sheet_sizes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_purchases   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pnl_expenses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pnl_revenues         ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns  ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log         ENABLE ROW LEVEL SECURITY;

-- Allow full access via anon key (since this is a single-owner admin panel)
-- For production: replace with auth.uid() checks once Supabase Auth is wired
DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'customers','subscriptions','quotations','quotation_items',
    'pricing_materials','pricing_sheet_sizes','pricing_services',
    'work_orders','suppliers','supplier_purchases',
    'pnl_expenses','pnl_revenues','planner_tasks',
    'marketing_campaigns','activity_log'
  ]
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS allow_all ON %I;
       CREATE POLICY allow_all ON %I FOR ALL TO anon USING (true) WITH CHECK (true);',
      tbl, tbl
    );
  END LOOP;
END;
$$;


-- ─── 14. SEED DATA ───────────────────────────────────────────────────────────

-- Pricing Materials
INSERT INTO pricing_materials (name, category, gsm, note, cost_per_sheet) VALUES
  ('Box Board (Grey Back)',  'board',    '350-400', 'Standard grey-back packaging board',    85.00),
  ('Ivory Back Board',       'board',    '300-350', 'Premium cream one-side coated',         120.00),
  ('White Back Board',       'board',    '300-400', 'White both sides, high quality',        140.00),
  ('Artboard',               'board',    '350-400', 'Premium art board - offset quality',    160.00),
  ('Art Paper',              'paper',    '130-200', 'Coated gloss / matte art paper',         65.00),
  ('Ice Gold',               'specialty','N/A',     'Metallic gold premium specialty',        280.00),
  ('Ice Silver',             'specialty','N/A',     'Metallic silver premium specialty',      280.00),
  ('Special Board',          'specialty','Custom',  'Custom premium substrates',              350.00)
ON CONFLICT DO NOTHING;

-- Sheet Sizes
INSERT INTO pricing_sheet_sizes (label, width_in, height_in, area_sqin, multiplier, note) VALUES
  ('30 × 21 inch', 30, 21, 630,  1.00, 'A3+ standard offset'),
  ('43 × 31 inch', 43, 31, 1333, 1.85, 'SRA3 large format'),
  ('40 × 25 inch', 40, 25, 1000, 1.45, 'Custom large format'),
  ('13 × 19 inch', 13, 19, 247,  0.55, 'A3 borderless digital'),
  ('12 × 18 inch', 12, 18, 216,  0.50, 'Small format digital')
ON CONFLICT DO NOTHING;

-- P&L Expenses (Seed)
INSERT INTO pnl_expenses (category, description, amount, expense_month, expense_year, recurring) VALUES
  ('domain',   'pixelwave.lk (2yr renewal)',     7200.00,  1, 2026, TRUE),
  ('domain',   'maxwelllanka.lk renewal',         3500.00,  3, 2026, TRUE),
  ('hosting',  'Hostinger Business Plan',         8900.00,  1, 2026, TRUE),
  ('vps',      'Supabase self-hosted VPS',        6500.00,  1, 2026, TRUE),
  ('vps',      'Supabase self-hosted VPS',        6500.00,  2, 2026, FALSE),
  ('vps',      'Supabase self-hosted VPS',        6500.00,  3, 2026, FALSE),
  ('vps',      'Supabase self-hosted VPS',        6500.00,  4, 2026, FALSE),
  ('vps',      'Supabase self-hosted VPS',        6500.00,  5, 2026, FALSE),
  ('vps',      'Supabase self-hosted VPS',        6500.00,  6, 2026, FALSE),
  ('internet', 'SLT Fiber 50 Mbps',              3990.00,  1, 2026, TRUE),
  ('internet', 'SLT Fiber 50 Mbps',              3990.00,  2, 2026, FALSE),
  ('internet', 'SLT Fiber 50 Mbps',              3990.00,  3, 2026, FALSE),
  ('internet', 'SLT Fiber 50 Mbps',              3990.00,  4, 2026, FALSE),
  ('internet', 'SLT Fiber 50 Mbps',              3990.00,  5, 2026, FALSE),
  ('internet', 'SLT Fiber 50 Mbps',              3990.00,  6, 2026, FALSE),
  ('ads',      'Facebook Ads - Packaging',        5000.00,  5, 2026, FALSE),
  ('ads',      'Facebook Ads - Laser',            4000.00,  6, 2026, FALSE),
  ('ads',      'Instagram Story Boost',           2500.00,  6, 2026, FALSE)
ON CONFLICT DO NOTHING;

-- P&L Revenues (Seed — YTD monthly)
INSERT INTO pnl_revenues (source, description, amount, revenue_month, revenue_year) VALUES
  ('Client Invoice', 'Jan 2026 total invoiced', 320000.00, 1, 2026),
  ('Client Invoice', 'Feb 2026 total invoiced', 410000.00, 2, 2026),
  ('Client Invoice', 'Mar 2026 total invoiced', 280000.00, 3, 2026),
  ('Client Invoice', 'Apr 2026 total invoiced', 540000.00, 4, 2026),
  ('Client Invoice', 'May 2026 total invoiced', 710000.00, 5, 2026),
  ('Client Invoice', 'Jun 2026 total invoiced', 630000.00, 6, 2026)
ON CONFLICT DO NOTHING;

-- Suppliers (Seed)
INSERT INTO suppliers (name, contact, category) VALUES
  ('Ceylinco Paper Merchants', '+94 11 234 5678', 'Board & Paper'),
  ('Kalhari Printing Supplies', '+94 77 987 1234', 'Specialty Paper'),
  ('Mihiri Blanks & Fabrics',  '+94 71 345 6789', 'T-Shirts & Fabric')
ON CONFLICT DO NOTHING;

-- ─── END OF SCHEMA v2 ────────────────────────────────────────────────────────
-- Tables: 15  |  Views: 2  |  Triggers: 4  |  Indexes: 10
-- Run this full script once in Supabase SQL Editor.
-- If tables already exist, IF NOT EXISTS prevents re-creation errors.
