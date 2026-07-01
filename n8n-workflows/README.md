# PixelWave - n8n AI Agent Workflows

n8n v2.23.4 ට අනුකූලව හදපු workflow templates. Coolify VPS එකේ deploy කරන්න පුළුවන්.

---

## 🎯 For AI Assistants (Gemini Pro / Claude Code)

This directory contains the complete technical reference for integrating n8n with the PixelWave admin panel.  
**Start here when asked to improve or build workflows:**

| File | What it contains |
|------|-----------------|
| `PIXELWAVE_API_REFERENCE.md` | **Full reference** — Supabase schemas, all component props, event handlers, exact API queries, data flow diagrams, env vars, mock data |
| `01-client-inquiry-agent.json` to `10-quote-price-calculator.json` | **10 n8n workflows** — see full list below |

**To AI:** Read `PIXELWAVE_API_REFERENCE.md` first — it contains all Supabase table schemas, front-end component props, event handler signatures, exact Supabase query strings, and the full data flow architecture needed to correctly connect n8n workflows to the admin panel.

---

## 📥 Import කරන හැටි

1. n8n dashboard එකට log වෙන්න
2. **Workflows** → **Import from File** ක්ලික් කරන්න
3. JSON file එක select කරන්න
4. Credentials connect කරන්න (Gemini API key, Supabase, Redis, RabbitMQ, Email, WhatsApp)
5. **Activate** කරන්න

---

## 🔄 Workflows (All 10)

### 📞 01 - Client Inquiry AI Agent
WhatsApp/Email එන inquiry එකක් auto parse කරලා Supabase වල quotation එකක් හදයි.

- **Trigger:** Webhook (`/webhook/client-inquiry`)
- **Flow:** Webhook → Parse Inquiry → Gemini Extract → Find/Upsert Customer → Create Quote → Create Items → Send Email → RabbitMQ Queue
- **Tables:** `customers`, `quotations`, `quotation_items`, `activity_log`
- **JSON:** `01-client-inquiry-agent.json`

### 🔄 02 - Document Lifecycle AI Agent
Quote එකක් Approved/Signed/Paid වුණාම auto convert කරලා notify කරයි.

- **Trigger:** Webhook (`/webhook/doc-lifecycle` — Supabase DB Webhook)
- **Flow:** Webhook → Route by Status → Get Customer → Gemini Decide (Approved) → Create Proforma / Create Work Order (Signed) / Mark Paid → Email → RabbitMQ Queue
- **Tables:** `quotations`, `customers`, `activity_log`
- **JSON:** `02-document-lifecycle-agent.json`

### 💰 03 - Payment Follow-up AI Agent
හැමදාම උදේ 8 ට unpaid documents check කරලා AI reminder message එකක් හදලා Email + WhatsApp වලින් යවයි.

- **Trigger:** Schedule (Daily 8 AM)
- **Flow:** Schedule → Fetch Unpaid (with customer join) → Filter 7+ days → Loop → Gemini Write Message → Redis Rate Check → Send Email → Send WhatsApp
- **Tables:** `quotations`, `customers`
- **JSON:** `03-payment-followup-agent.json`

### 📦 04 - Supplier Auto-Reorder Agent
Suppliers 60+ days inactive නම් auto alert එකක් දාලා ලොග් කරනවා.

- **Trigger:** Schedule (Weekly, Monday 9 AM)
- **Flow:** Schedule → Fetch Suppliers → Fetch Purchases → Analyze Stock → Gemini Write Alert → Email Team → Log Activity
- **Tables:** `suppliers`, `supplier_purchases`, `activity_log`
- **JSON:** `04-supplier-auto-reorder.json`

### 📢 05 - Campaign Dispatch AI Agent
Marketing campaigns WhatsApp/Email වලින් auto send කරලා status track කරනවා.

- **Trigger:** Schedule (Every 30 min)
- **Flow:** Schedule → Fetch Pending Campaigns → Loop → Mark Sending → Route by Channel → Get Customers → Gemini Personalize → Send WhatsApp / Email → Update Sent Count → Log
- **Tables:** `marketing_campaigns`, `customers`, `activity_log`
- **JSON:** `05-campaign-dispatch-agent.json`

### 💳 06 - Subscription Billing Agent
Subscriptions renewal_date එකට දින 3 කට කලින් auto invoice හදලා client ට යවනවා.

- **Trigger:** Schedule (Daily 6 AM)
- **Flow:** Schedule → Fetch Active Subs → Check Renewal Dates → Loop → Create Invoice → Create Invoice Item → Email → Log
- **Tables:** `subscriptions`, `customers`, `quotations`, `quotation_items`, `activity_log`
- **JSON:** `06-subscription-billing-agent.json`

### 🏭 07 - Kanban Production Notifier
Work order එකක් column එකක් change වුණාම team ට email notification එකක් යවනවා.

- **Trigger:** Webhook (`/webhook/kanban-update` — Supabase DB Webhook)
- **Flow:** Webhook → Parse Event → Route by Column → Gemini Generate Message → Email Team → Log
- **Tables:** `work_orders`, `activity_log`
- **JSON:** `07-kanban-production-notifier.json`

### 📊 08 - Monthly P&L Reporter
හැම මාසෙම 1 වෙනිදා auto P&L report එකක් generate කරලා admin ට email කරනවා.

- **Trigger:** Schedule (Monthly 1st, 7 AM)
- **Flow:** Schedule → Calc Previous Month → Fetch Expenses → Fetch Revenues → Calculate P&L → Gemini Write Summary → Email Report → Log
- **Tables:** `pnl_expenses`, `pnl_revenues`, `activity_log`
- **JSON:** `08-monthly-pnl-reporter.json`

### 📝 09 - Activity Logger (Central)
Supabase tables වල හැම change එකක්ම auto detect කරලා `activity_log` table එකට ලොග් කරනවා.

- **Trigger:** Webhook (`/webhook/activity-log` — Supabase DB Webhook for ALL tables)
- **Flow:** Webhook → Classify Event (table, operation, detail) → Write to activity_log
- **Tables:** ALL tables → `activity_log`
- **JSON:** `09-activity-logger.json`

### 🧮 10 - Quote Price Calculator Agent
Pricing database එකෙන් materials/sizes/services අරගෙන Gemini එක්ක calculate කරලා price එක return කරනවා.

- **Trigger:** Webhook (`/webhook/price-calc` — From DocEditor/PricingMatrix)
- **Flow:** Webhook → Parse Request → Fetch Materials → Fetch Sizes → Fetch Services → Gemini Calculate → Return to Webhook → Log
- **Tables:** `pricing_materials`, `pricing_sheet_sizes`, `pricing_services`, `activity_log`
- **JSON:** `10-quote-price-calculator.json`

---

## 🔐 Credentials Setup

**Postgres වෙනුවට Supabase REST API** use කරනවා (HTTP Request nodes).

| Credential | Type | n8n Name | Source |
|---|---|---|---|
| Supabase | Generic Credential (Header/Query) | `supabaseCredentials` | Supabase Project Settings → API (`service_role` key) |
| Gemini | API Key | `geminiApiKey` | Google AI Studio |
| Redis | Redis | `redis` | Coolify |
| RabbitMQ | RabbitMQ | `rabbitmq` | Coolify |
| Email | SMTP | `smtp` | Hostinger (mail.pixelwave.lk) |
| WhatsApp | Generic Credential | `whatsappCredentials` | Meta Developer Console |

### Supabase Credentials Setup

1. n8n → **Credentials** → **Add Credential** → **Generic Credential (Header / Query)**
2. Name: `supabaseCredentials`
3. Headers tab එකේ add කරන්න:
   - `apikey` → ඔයාගේ Supabase `service_role` key එක
   - `Authorization` → `Bearer <service_role key>`
4. Base URL: `https://xxxxx.supabase.co`

> **Import කරපටි පස්සේ** හැම HTTP Request node එකේම `$credentials.supabaseUrl` / `$credentials.supabaseApiKey` references check කරලා ඔයාගේ credential name එකට match කරන්න.

### Gemini API Key

Google AI Studio: https://aistudio.google.com/app/apikey → API Key හදාගෙන n8n එකේ **API Key** type credential එකක් `geminiApiKey` නමින් හදන්න.

---

## 📋 Technical Reference

All technical details (schemas, queries, props, data flow) are in:

👉 **`PIXELWAVE_API_REFERENCE.md`** 👈

Give this file to Gemini Pro / Claude Code when improving workflows — it contains:
- Supabase database schema (15 tables with columns, types, FKs)
- Every component prop and event handler signature
- Exact Supabase query strings used in the front-end
- n8n webhook endpoints and payload formats
- Data flow diagrams (read/write/convert)
- Document status lifecycle
- Mock data and environment variables
