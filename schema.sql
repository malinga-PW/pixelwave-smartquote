-- PostgreSQL Database Blueprint for PixelWave SmartQuote SaaS Platform
-- Paste this script directly into your Supabase SQL Editor.

-- Enable UUID generator extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  plan_name VARCHAR(100) NOT NULL, -- e.g., 'Hosting + SmartQuote Bundle', 'SaaS Starter'
  monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'Active', -- Active, Suspended, Pending
  renewal_date DATE NOT NULL,
  subdomain VARCHAR(255), -- e.g., 'topleaf.pixelwave.lk'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Quotations / Transaction Lifecycle Table
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_no VARCHAR(50) UNIQUE NOT NULL, -- e.g., PW-2026-0042
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type VARCHAR(20) NOT NULL DEFAULT 'Quote', -- Quote, Proforma, Agreement, Order, Invoice
  status VARCHAR(20) NOT NULL DEFAULT 'Draft', -- Draft, Sent, Approved, Signed, Paid, In Production, Completed
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
  tax_percentage NUMERIC(5, 2) DEFAULT 0.00,
  grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Quotation Line Items Table
CREATE TABLE IF NOT EXISTS quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  item_title VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  line_total NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------
-- Seed Data for Testing (Optional)
-- ----------------------------------------------------

-- Insert Sample Customers
-- INSERT INTO customers (id, name, phone, email, address) VALUES
-- ('c7b1b36a-2d93-4a5e-8b1b-aa3e4b9d0042', 'Topleaf Plantations Pvt Ltd', '+94 77 123 4567', 'info@topleafceylon.com', 'No. 45, Kandy Road, Colombo 10, Sri Lanka'),
-- ('c7b1b36a-2d93-4a5e-8b1b-aa3e4b9d0041', 'Green Field Tea Exporters', '+94 11 255 8899', 'purchasing@greenfield.lk', '102/B, Industrial Zone, Biyagama, Sri Lanka'),
-- ('c7b1b36a-2d93-4a5e-8b1b-aa3e4b9d0040', 'TechStart Hub (Asia)', '+94 77 987 6543', 'accounts@techstart.asia', 'Level 4, Hatch Works, Colombo 01, Sri Lanka');

-- Insert Sample Subscriptions
-- INSERT INTO subscriptions (customer_id, plan_name, monthly_fee, status, renewal_date, subdomain) VALUES
-- ('c7b1b36a-2d93-4a5e-8b1b-aa3e4b9d0042', 'Hosting + SmartQuote Bundle', 15000.00, 'Active', '2026-07-28', 'topleaf.pixelwave.lk'),
-- ('c7b1b36a-2d93-4a5e-8b1b-aa3e4b9d0041', 'Premium E-Commerce SLA', 30000.00, 'Active', '2026-07-15', 'greenfield.pixelwave.lk'),
-- ('c7b1b36a-2d93-4a5e-8b1b-aa3e4b9d0040', 'Business Automation SaaS Care', 50000.00, 'Pending', '2026-07-10', 'techstart.pixelwave.lk');
