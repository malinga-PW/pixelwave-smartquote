# PixelWave Business OS — Full API & Integration Reference

> **Purpose:** Single source of truth for n8n AI Agent workflow development.  
> Use this document with Gemini Pro / Claude Code to build production-ready integrations between n8n and the PixelWave admin panel.

---

## 1. SYSTEM ARCHITECTURE

```
Client Browser
    │
    ├── app/page.js (Admin Panel — SPA, tab-based)
    │     Props → 16 Child Components
    │     State → documents, activeTab, viewDocument, etc.
    │     Data → Supabase + mockDatabase.js fallback
    │
    ├── app/secure/[id]/page.js (Client Portal — public)
    │     Fetches document by UUID/quote_no
    │     Renders ClientPortal with sign/pay/approve actions
    │
    └── lib/supabaseClient.js (DB client — online/offline hybrid)
          │
          ▼
    Supabase PostgreSQL (15 tables, RLS enabled)
          │
          ▼
    n8n v2.23.4 (3 workflows in n8n-workflows/)
          │
          ├── Webhook ← WhatsApp / Email
          ├── Gemini AI Agent
          ├── Supabase REST API
          ├── Redis (rate limiting / cache)
          └── RabbitMQ (async queues)
```

---

## 2. SUPABASE DATABASE SCHEMA

### Table: `customers`
| Column | Type | FK | Notes |
|--------|------|----|-------|
| `id` | UUID PK | | `gen_random_uuid()` |
| `name` | VARCHAR(255) NOT NULL | | |
| `phone` | VARCHAR(50) | | |
| `email` | VARCHAR(255) | | Used for upsert conflict |
| `address` | TEXT | | |
| `company` | VARCHAR(255) | | |
| `notes` | TEXT | | |
| `created_at` | TIMESTAMPTZ | | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | | DEFAULT NOW() |

### Table: `quotations`
| Column | Type | FK | Notes |
|--------|------|----|-------|
| `id` | UUID PK | | |
| `quote_no` | VARCHAR(60) UNIQUE NOT NULL | | Format: `PW-YYYYMMDD-XXXX` |
| `customer_id` | UUID | → customers.id ON DELETE SET NULL | |
| `issue_date` | DATE NOT NULL | | DEFAULT CURRENT_DATE |
| `type` | VARCHAR(20) | | CHECK: Quote, Proforma, Agreement, Order, Invoice |
| `status` | VARCHAR(30) | | CHECK: Draft, Sent, Approved, Rejected, Revised, Unpaid, Signed, Paid, In Production, Completed |
| `subtotal` | NUMERIC(14,2) | | |
| `discount_percentage` | NUMERIC(5,2) | | |
| `tax_percentage` | NUMERIC(5,2) | | |
| `grand_total` | NUMERIC(14,2) | | |
| `currency` | CHAR(3) | | DEFAULT 'LKR' |
| `notes` | TEXT | | |
| `terms` | TEXT | | |
| `created_at` | TIMESTAMPTZ | | |
| `updated_at` | TIMESTAMPTZ | | |

### Table: `quotation_items`
| Column | Type | FK | Notes |
|--------|------|----|-------|
| `id` | UUID PK | | |
| `quotation_id` | UUID | → quotations.id ON DELETE CASCADE | |
| `item_title` | VARCHAR(255) NOT NULL | | |
| `description` | TEXT | | |
| `quantity` | NUMERIC(10,2) | | DEFAULT 1 |
| `unit_price` | NUMERIC(14,2) | | |
| `line_total` | NUMERIC(14,2) | | GENERATED: `quantity * unit_price` |
| `created_at` | TIMESTAMPTZ | | |

### Table: `subscriptions`
| Column | Type | FK | Notes |
|--------|------|----|-------|
| `id` | UUID PK | | |
| `customer_id` | UUID | → customers.id ON DELETE CASCADE | |
| `plan_name` | VARCHAR(150) NOT NULL | | |
| `monthly_fee` | NUMERIC(12,2) | | |
| `status` | VARCHAR(20) | | CHECK: Active, Pending, Suspended, Cancelled |
| `renewal_date` | DATE NOT NULL | | |
| `subdomain` | VARCHAR(255) | | |
| `company` | VARCHAR(255) | | |

### Table: `work_orders`
| Column | Type | FK | Notes |
|--------|------|----|-------|
| `id` | UUID PK | | |
| `quotation_id` | UUID | → quotations.id ON DELETE SET NULL | |
| `title` | VARCHAR(255) NOT NULL | | |
| `client_name` | VARCHAR(255) | | |
| `kanban_col` | VARCHAR(30) | | CHECK: todo, inprogress, review, done |
| `priority` | VARCHAR(10) | | CHECK: urgent, normal, low |
| `due_date` | DATE | | |
| `notes` | TEXT | | |
| `assigned_to` | VARCHAR(100) | | |

### Table: `pricing_materials`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `name` | VARCHAR(150) NOT NULL | |
| `category` | VARCHAR(50) | board, paper, fabric, specialty |
| `gsm` | VARCHAR(50) | |
| `cost_per_sheet` | NUMERIC(10,2) | |

### Table: `pricing_services`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `category` | VARCHAR(30) | CHECK: board, design, screen, laser, dev |
| `label` | VARCHAR(200) NOT NULL | |
| `unit` | VARCHAR(80) NOT NULL | |
| `base_rate` | NUMERIC(12,2) | |

### Table: `pricing_sheet_sizes`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `label` | VARCHAR(100) | e.g. "30 × 21 inch" |
| `width_in` | NUMERIC(6,2) | |
| `height_in` | NUMERIC(6,2) | |
| `multiplier` | NUMERIC(6,4) | |

### Table: `suppliers`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `name` | VARCHAR(255) NOT NULL | |
| `contact` | VARCHAR(100) | |
| `category` | VARCHAR(100) | |

### Table: `supplier_purchases`
| Column | Type | FK |
|--------|------|----|
| `id` | UUID PK | |
| `supplier_id` | UUID | → suppliers.id ON DELETE CASCADE |
| `material` | VARCHAR(255) NOT NULL | |
| `quantity` | NUMERIC(12,2) | |
| `unit` | VARCHAR(50) | Full Sheet, Units, Kg, Roll, Ream |
| `unit_cost` | NUMERIC(12,2) | |
| `client_bill_rate` | NUMERIC(12,2) | |

### Table: `pnl_expenses`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `category` | VARCHAR(30) | CHECK: domain, hosting, vps, internet, ads, other |
| `description` | VARCHAR(255) NOT NULL | |
| `amount` | NUMERIC(12,2) | |
| `expense_month` | INT (1-12) | |
| `expense_year` | INT | |

### Table: `pnl_revenues`
| Column | Type | FK |
|--------|------|----|
| `id` | UUID PK | |
| `source` | VARCHAR(100) | |
| `amount` | NUMERIC(12,2) | |
| `revenue_month` | INT (1-12) | |
| `revenue_year` | INT | |
| `quotation_id` | UUID | → quotations.id ON DELETE SET NULL |

### Table: `marketing_campaigns`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `name` | VARCHAR(255) NOT NULL | |
| `channel` | VARCHAR(30) | CHECK: whatsapp, email, sms, instagram, facebook |
| `message` | TEXT | |
| `status` | VARCHAR(20) | CHECK: draft, scheduled, sent, failed |
| `sent_count` | INT | |

### Table: `planner_tasks`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `title` | VARCHAR(255) NOT NULL | |
| `category` | VARCHAR(20) | CHECK: ops, analytics, social |
| `day_of_week` | VARCHAR(10) | |
| `priority` | VARCHAR(10) | CHECK: urgent, normal, low |

### Table: `activity_log`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `action` | VARCHAR(100) | e.g. 'quote_created', 'status_changed' |
| `entity_type` | VARCHAR(50) | 'quotation', 'customer', 'subscription' |
| `entity_id` | VARCHAR(100) | |
| `detail` | TEXT | |

### Views
- `supplier_margin_summary` — computed margin per supplier
- `pnl_monthly_summary` — monthly P&L rollup (COALESCE-based)

---

## 3. FRONT-END COMPONENT PROPS & PARAMETERS

### `page.js` — Root State & Tab Routing

**State Variables:**
```
activeTab: string           // default 'dashboard'
documents: array            // default initialDocuments (mock)
viewDocument: object|null   // default null
notification: object|null   // { message, type }
isSupabaseConnected: bool   // default false
isAuthenticated: bool       // default false (sessionStorage check)
isDark: bool                // default true
sidebarExpanded: bool       // default true
```

**Tab → Component Mapping:**
```
'dashboard'  → <Dashboard  documents={documents} setViewDocument={fn} setActiveTab={fn} />
'editor'     → <DocEditor   viewDocument={viewDocument} onSaveDocument={fn} onConvertDocument={fn}
                              documents={documents} isDark={isDark} setActiveTab={fn} />
'suppliers'  → <SupplierTracker isDark={isDark} />
'pnl'        → <PnLTracker  isDark={isDark} />
'portal'     → <ClientPortal activeDocument={viewDocument} onUpdateStatus={fn} isDark={isDark} />
'clients'    → <ClientsSubscriptions isDark={isDark} />
'calendar'   → <OperationsCalendar />
'pricing'    → <PricingMatrix onSendToDocBuilder={fn} setActiveTab={fn} isDark={isDark} />
'kanban'     → <KanbanBoard />
'marketing'  → <MarketingHub />
'customizer' → <BrandCustomizer />
'n8n'        → <N8nWorkflow />
```

### TopBar.jsx
```javascript
<TopBar
  isDark={boolean}              // Theme state
  setIsDark={setIsDark}         // Theme toggler
  onLogout={handleLogout}       // Clears session + redirects to login
  isSupabaseConnected={bool}    // DB status indicator
/>
```

### Sidebar.jsx
```javascript
<Sidebar
  activeTab={activeTab}         // Current active tab id
  setActiveTab={setActiveTab}   // Tab switcher
  isDark={isDark}
  expanded={sidebarExpanded}    // Collapse state
  setExpanded={setSidebarExpanded}
/>
```

### Dashboard.jsx
```javascript
<Dashboard
  documents={documents}         // Full document array for KPI charts + table
  setViewDocument={(doc) => {   // Click row → view in editor
    setViewDocument(doc);
    setActiveTab('editor');
  }}
  setActiveTab={setActiveTab}
/>
```

### DocEditor.jsx
```javascript
<DocEditor
  viewDocument={object|null}    // Document being edited (null = new doc)
  onSaveDocument={fn}           // handleSaveDocument (saves locally + Supabase)
  onConvertDocument={fn}        // handleConvertDocument (Quote→Proforma/Agreement)
  documents={documents}         // For quote number generation
  isDark={boolean}
  setActiveTab={setActiveTab}   // For Portal button navigation
/>
```

### ClientPortal.jsx
```javascript
<ClientPortal
  activeDocument={object|null}  // Document to display
  onUpdateStatus={fn}           // handleUpdateStatus (Sign/Pay/Approve)
/>
```

### PricingMatrix.jsx
```javascript
<PricingMatrix
  onSendToDocBuilder={(item) => {  // Add item then switch to editor
    setViewDocument(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setActiveTab('editor');
  }}
  setActiveTab={setActiveTab}
  isDark={boolean}
/>
```

### ClientsSubscriptions.jsx
```javascript
<ClientsSubscriptions isDark={boolean} />
```

### SupplierTracker.jsx
```javascript
<SupplierTracker isDark={boolean} />
```

### PnLTracker.jsx
```javascript
<PnLTracker isDark={boolean} />
```

### Self-contained (no props):
- `KanbanBoard.jsx`
- `OperationsCalendar.jsx`
- `MarketingHub.jsx`
- `BrandCustomizer.jsx`
- `N8nWorkflow.jsx`

---

## 4. EVENT HANDLERS (page.js → Child Callbacks)

### `handleSaveDocument(savedDoc)`
```
Purpose:  Save/create a quotation (local + Supabase)
Params:   savedDoc = {
            id, quote_no, customer_name, customer_email,
            customer_phone, customer_address, issue_date,
            type, status, subtotal, discount_percentage,
            tax_percentage, grand_total, notes, terms,
            items: [{ id, item_title, description, qty, unit_price, line_total }]
          }
Flow:     1. Update local documents[] state
          2. Set viewDocument = savedDoc
          3. If supabase connected:
             a. INSERT customer (fallback: SELECT existing by email)
             b. UPSERT quotation (onConflict: quote_no)
             c. DELETE old items → INSERT new items
             d. fetchLiveDocuments() to refresh
          4. Show success/error notification
```

### `handleConvertDocument(docId, newType)`
```
Purpose:  Convert Quote → Proforma / Agreement / Invoice
Params:   docId: string, newType: string
Flow:     1. Find source document by docId
          2. Create suffix: 'PI' / 'AG' / 'INV'
          3. Generate new quote_no: `${source}-${suffix}`
          4. Set default status per type
          5. Call handleSaveDocument(newDoc)
Conversion suffix mapping:
  'Proforma'   → '-PI'   status: 'Unpaid'
  'Agreement'  → '-AG'   status: 'Draft'
  'Invoice'    → '-INV'  status: 'Sent'
```

### `handleUpdateStatus(docId, newStatus)`
```
Purpose:  Update document status (local + Supabase)
Params:   docId: string, newStatus: string
Flow:     1. Update local documents[] by id match
          2. If Agreement + Signed → auto-generate Work Order after 2.5s:
             Creates new Order doc with quote_no suffix '-WO'
          3. Supabase: quotations.update({ status }).eq('quote_no', docId)
```

### `handleLogout()`
```
Purpose:  Clear auth session, show login screen
Flow:     sessionStorage.removeItem('pw_admin_auth')
          setIsAuthenticated(false)
```

---

## 5. SUPABASE QUERIES (Full Reference)

### Main Admin Panel (`app/page.js`)
```javascript
// Fetch all documents (on mount)
supabase.from('quotations')
  .select(`*, customers(name, email, phone, address), quotation_items(*)`)
  .order('created_at', { ascending: false })

// Save customer
supabase.from('customers')
  .insert({ name, email, phone, address })
  .select().single()

// Find existing customer (fallback)
supabase.from('customers')
  .select('id').eq('name', customer_name).limit(1).single()

// Upsert quotation
supabase.from('quotations')
  .upsert({ quote_no, customer_id, issue_date, type, status, subtotal,
            discount_percentage, tax_percentage, grand_total, notes, terms },
          { onConflict: 'quote_no' })
  .select().single()

// Delete old items
supabase.from('quotation_items')
  .delete().eq('quotation_id', quoteObj.id)

// Insert new items
supabase.from('quotation_items')
  .insert(itemsToInsert)

// Update status
supabase.from('quotations')
  .update({ status: newStatus })
  .eq('quote_no', docId)
```

### Client Portal (`app/secure/[id]/page.js`)
```javascript
// Fetch single document (by UUID or quote_no)
supabase.from('quotations')
  .select(`*, customers(name, email, phone, address), quotation_items(*)`)
  .eq('id', id)                    // or .eq('quote_no', id)
  .single()

// Update status (Same as above)
supabase.from('quotations')
  .update({ status: newStatus })
  .eq('quote_no', docId)

// Generate Work Order
supabase.from('quotations')
  .select('id, customer_id').eq('quote_no', quote_no).single()

supabase.from('quotations')
  .upsert({ quote_no, customer_id, issue_date, type: 'Order',
            status: 'In Production', notes }, { onConflict: 'quote_no' })
  .select().single()

supabase.from('quotation_items')
  .insert(itemsToInsert)

supabase.from('work_orders')
  .insert({ quotation_id, title: client_name + ' - Work Order',
            client_name, kanban_col: 'todo', priority: 'normal', notes })
```

### ClientsSubscriptions.jsx
```javascript
supabase.from('subscriptions')
  .select('*, customers(name)').order('created_at', { ascending: false })

supabase.from('customers').select('id').eq('name', newName).limit(1)
supabase.from('customers').insert({ name, company }).select()
supabase.from('subscriptions').insert({ customer_id, plan_name, monthly_fee,
  subdomain, renewal_date, company, status: 'Active' }).select('*, customers(name)')

supabase.from('subscriptions').update({ status: nextStatus }).eq('id', id).select()
```

### PricingMatrix.jsx
```javascript
supabase.from('pricing_materials').select('*').eq('is_active', true)
supabase.from('pricing_sheet_sizes').select('*').eq('is_active', true)
supabase.from('pricing_services').select('*').eq('is_active', true)
```

### SupplierTracker.jsx
```javascript
supabase.from('suppliers').select('*').order('name')
supabase.from('supplier_purchases').select('*').order('purchase_date', { ascending: false })

supabase.from('suppliers').insert({ name, contact, category, notes: '' }).select()
supabase.from('supplier_purchases').insert({ supplier_id, material, quantity,
  unit, unit_cost, client_bill_rate, purchase_date }).select()
supabase.from('supplier_purchases').delete().eq('id', purchaseId)
```

### PnLTracker.jsx
```javascript
supabase.from('pnl_expenses').select('*').order('created_at', { ascending: false })
supabase.from('pnl_revenues').select('*')

supabase.from('pnl_expenses').insert({ category, description, amount,
  expense_month: month, expense_year: year, recurring: false }).select()

supabase.from('pnl_revenues').update({ revenue }).eq('id', exists.id).select()
supabase.from('pnl_revenues').insert({ revenue_month: month, revenue_year: year,
  revenue }).select()

supabase.from('pnl_expenses').delete().eq('id', id)
```

---

## 6. n8n WEBHOOK & INTEGRATION POINTS

### In-App n8n Webhook Config (from N8nWorkflow.jsx)
```
Webhook Path:  /webhooks/v1/client-inquiry
AI Model:      Gemini 3.5 Flash (High)
Agent Tools:   calculate_printing_price, packaging_cost_matrix, fetch_crm_contact
DB Action:     UPSERT on quotations table
Notifications: Meta Cloud API v19.0 (WhatsApp), SendGrid Web API (Email)
```

### Client Portal Webhook Events (from ClientPortal.jsx)
```javascript
// Fired on: Sign, Pay, Approve actions
{
  event: "document.signed" | "document.paid" | "quote.approved",
  timestamp: "ISO datetime",
  n8n_version: "2.23.4",
  workflow_id: "wf-pixelwave-billing-lifecycle",
  data: {
    document_id: doc.id,
    quote_no: doc.quote_no,
    customer_name: doc.customer_name,
    customer_email: doc.customer_email,
    grand_total: doc.grand_total,
    status: doc.status
  }
}
```

### n8n Workflow Webhook Endpoints (All 10)
```
Webhook 01:  /webhook/client-inquiry    (01-client-inquiry-agent.json)
Webhook 02:  /webhook/doc-lifecycle     (02-document-lifecycle-agent.json)
Webhook 04:  (none — Schedule trigger, Weekly Mon 9 AM)
Webhook 05:  (none — Schedule trigger, Every 30 min)
Webhook 06:  (none — Schedule trigger, Daily 6 AM)
Webhook 07:  /webhook/kanban-update     (07-kanban-production-notifier.json)
Webhook 08:  (none — Schedule trigger, Monthly 1st 7 AM)
Webhook 09:  /webhook/activity-log      (09-activity-logger.json)
Webhook 10:  /webhook/price-calc        (10-quote-price-calculator.json)
```

### Supabase Database Webhooks Required
Enable Supabase Database Webhooks for these tables to trigger n8n:
| Workflow | Table | Events | n8n Webhook URL |
|----------|-------|--------|----------------|
| 02 | `quotations` | INSERT, UPDATE | `https://your-n8n.domain/webhook/doc-lifecycle` |
| 07 | `work_orders` | INSERT, UPDATE | `https://your-n8n.domain/webhook/kanban-update` |
| 09 | ALL tables | INSERT, UPDATE, DELETE | `https://your-n8n.domain/webhook/activity-log` |

### Gemini API Configuration (for n8n HTTP Request nodes)
```
Endpoint: POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
Headers:  Content-Type: application/json
          x-goog-api-key: {{ $credentials.geminiApiKey }}
Body: {
  contents: [{
    role: "user",
    parts: [{ text: "prompt with ${$json.field} interpolation" }]
  }]
}
```

### Supabase REST API Endpoints (for n8n HTTP Request nodes)

Used by all 10 workflows. All via HTTP Request nodes with Generic Credential auth.

```
Base URL: {{ $credentials.supabaseUrl }}/rest/v1/
Headers:  apikey: {{ $credentials.supabaseApiKey }}
          Authorization: Bearer {{ $credentials.supabaseApiKey }}
          Content-Type: application/json
          Prefer: return=representation  (for POST returning data)

═══ CUSTOMERS ═══
  GET    /customers?select=id,name,email,phone,address&email=eq.{email}
  GET    /customers?select=id,name,email,phone&not.is.phone=null&limit=100
  POST   /customers?on_conflict=email
  PATCH  /customers?id=eq.{id}

═══ QUOTATIONS ═══
  GET    /quotations?select=*,customers!inner(name,email,phone)&status=eq.Unpaid&order=created_at.asc
  GET    /quotations?select=*,customers!inner(name,email,phone,address),quotation_items(*)
  POST   /quotations                                        (Prefer: return=representation)
  PATCH  /quotations?quote_no=eq.{quote_no}
  PATCH  /quotations?id=eq.{id}                             (for UUID-based update)

═══ QUOTATION ITEMS ═══
  POST   /quotation_items
  DELETE /quotation_items?quotation_id=eq.{id}

═══ WORK ORDERS ═══
  POST   /work_orders

═══ SUBSCRIPTIONS ═══
  GET    /subscriptions?select=*,customers!inner(name,email,phone,address)&status=eq.Active&order=renewal_date.asc

═══ SUPPLIERS ═══
  GET    /suppliers?select=id,name,contact,category,notes,is_active&is_active=eq.true

═══ SUPPLIER PURCHASES ═══
  GET    /supplier_purchases?select=*,suppliers(name)&order=purchase_date.desc&limit=100

═══ PRICING ═══
  GET    /pricing_materials?select=*&is_active=eq.true&category=eq.{category}
  GET    /pricing_sheet_sizes?select=*&is_active=eq.true
  GET    /pricing_services?select=*&is_active=eq.true

═══ P&L ═══
  GET    /pnl_expenses?select=*&expense_month=eq.{m}&expense_year=eq.{y}
  GET    /pnl_revenues?select=*&revenue_month=eq.{m}&revenue_year=eq.{y}

═══ MARKETING ═══
  GET    /marketing_campaigns?status=eq.draft&select=*&order=created_at.asc
  PATCH  /marketing_campaigns?id=eq.{id}

═══ ACTIVITY LOG ═══
  POST   /activity_log
```

### Quote Number Format
```
Format: PW-{YYYYMMDD}-{XXXX}
Example: PW-20260701-3841
Generated in: DocEditor.jsx (front-end) & n8n workflow 01 (code node)
```

---

## 7. DATA FLOW DIAGRAMS

### Document Read Flow
```
[Supabase DB] ──GET──→ [page.js fetchLiveDocuments()]
                           │
                    map to front-end format
                           │
                    setDocuments(mappedDocs)
                           │
               ┌───────────┼───────────┐
               ▼           ▼           ▼
         <Dashboard>  <DocEditor>  <ClientPortal>
          documents=   viewDocument= activeDocument=
          {documents}  {viewDocument} {viewDocument}
```

### Document Write Flow
```
[DocEditor]           [ClientPortal]
   │                      │
   │ handleSave()          │ onUpdateStatus(id, status)
   │ onSaveDocument(doc)   │
   ▼                      ▼
[page.js handlers]
   │
   ├── 1. Update local state (setDocuments)
   │
   └── 2. If supabase connected:
          │
          ├── customers.insert({ name, email, phone, address })
          ├── quotations.upsert({ quote_no, ... }, { onConflict: 'quote_no' })
          ├── quotation_items.delete().eq('quotation_id', id)
          ├── quotation_items.insert(items)
          └── fetchLiveDocuments()  // refresh
```

### Document Conversion Flow
```
[DocEditor] → handleConvert(type)
   │
   ▼
[page.js handleConvertDocument(docId, newType)]
   │
   ├── Find source doc by id
   ├── Generate new quote_no with suffix (-PI/-AG/-INV)
   ├── Set default status
   └── Call handleSaveDocument(newDoc)
```

### Work Order Auto-Generation Flow
```
[ClientPortal] → onUpdateStatus(id, 'Signed')
   │
   ▼
[page.js handleUpdateStatus(docId, 'Signed')]
   │
   ├── Update local status
   └── After 2.5s: handleSaveDocument({
         quote_no: `${original}-WO`,
         type: 'Order',
         status: 'In Production',
         notes: 'Auto-generated from signed Agreement...'
       })
```

---

## 8. ENVIRONMENT VARIABLES

File: `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=http://supabasekong-uh7w2lgy5fmp5c7c5rjprb3c.46.202.164.69.sslip.io
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### n8n Credentials Required (for all 10 workflows)
| Credential Name | Type | Used By Workflows | Source |
|----------------|------|-------------------|--------|
| `geminiApiKey` | API Key | 01, 02, 03, 04, 05, 07, 08, 10 | Google AI Studio |
| `supabaseCredentials` | Generic Credential (Header/Query) | ALL (01-10) | Supabase Project Settings → API (`service_role` key) |
| `redis` | Redis Basic | 03 (rate limiting) | Coolify Redis service |
| `rabbitmq` | RabbitMQ | 01, 02 (async queues) | Coolify RabbitMQ service |
| `smtp` | SMTP | 01, 02, 03, 04, 05, 06, 07, 08 | Hostinger email |
| `whatsappCredentials` | Generic Credential | 03, 05 (WhatsApp sends) | Meta Developer Console |

---

## 9. MOCK DATA (Offline Fallback)

### `data/mockDatabase.js`

**initialDocuments** — 5 seed documents:
| quote_no | Customer | Type | Status | Value (LKR) |
|----------|----------|------|--------|-------------|
| PW-2026-0042 | Topleaf Plantations | Quote | Draft | 30,000.00 |
| PW-2026-0041 | Green Field Tea Exporters | Quote | Approved | 145,350.00 |
| PW-2026-0040 | TechStart Hub (Asia) | Agreement | Signed | 405,000.00 |
| PW-2026-0039 | Apex Merchandise | Order | In Production | 189,000.00 |
| PW-2026-0038 | Lanka Crafted Gifts | Invoice | Paid | 85,000.00 |

**mockAIIntakePresets** — 4 AI parse test presets:
| Service | Channel | Sender | Items |
|---------|---------|--------|-------|
| Packaging Design | WhatsApp | Topleaf Cinnamon | Luxury carton (500 qty) |
| Screen Printing | Email | Apex Merchandise | T-shirt print (200 qty) |
| n8n Workflow Automation | WhatsApp | TechStart Hub | AI Agent workflow dev |
| Laser Engraving | Email | Lanka Crafted Gifts | Wooden signage (50 qty) |

---

## 10. DOCUMENT STATUS WORKFLOW

```
Quote:     Draft → Sent → Approved → Revised
                                    ↓
Proforma:  Unpaid → Paid
                    ↓
Agreement: Draft → Signed
                   ↓
Order:     Pending → In Production → Completed
                                        ↓
Invoice:   Draft → Sent → Paid
```

---

## 11. N8n WORKFLOW FILE REFERENCE (All 10)

Files in `n8n-workflows/`:

| # | File | Purpose | Trigger | Supabase Tables Used | Credentials |
|---|------|---------|---------|---------------------|-------------|
| 01 | `01-client-inquiry-agent.json` | Auto-parse WhatsApp/Email → Create Quote | Webhook `/webhook/client-inquiry` | customers, quotations, quotation_items, activity_log | Gemini, Supabase, Email, RabbitMQ, WhatsApp |
| 02 | `02-document-lifecycle-agent.json` | Auto-convert Approved/Signed/Paid | Webhook `/webhook/doc-lifecycle` | quotations, customers, activity_log | Gemini, Supabase, Email, RabbitMQ |
| 03 | `03-payment-followup-agent.json` | Daily unpaid AI reminder | Schedule **Daily 8AM** | quotations, customers | Gemini, Supabase, Redis, Email, WhatsApp |
| 04 | `04-supplier-auto-reorder.json` | Weekly supplier inactivity alert | Schedule **Weekly Mon 9AM** | suppliers, supplier_purchases, activity_log | Gemini, Supabase, Email |
| 05 | `05-campaign-dispatch-agent.json` | Dispatch marketing campaigns | Schedule **Every 30min** | marketing_campaigns, customers, activity_log | Gemini, Supabase, Email, WhatsApp |
| 06 | `06-subscription-billing-agent.json` | Auto invoice on renewal (3 days before) | Schedule **Daily 6AM** | subscriptions, customers, quotations, quotation_items, activity_log | Supabase, Email |
| 07 | `07-kanban-production-notifier.json` | Team alert on kanban column move | Webhook `/webhook/kanban-update` | work_orders, activity_log | Gemini, Supabase, Email |
| 08 | `08-monthly-pnl-reporter.json` | Monthly P&L report with AI summary | Schedule **Monthly 1st 7AM** | pnl_expenses, pnl_revenues, activity_log | Gemini, Supabase, Email |
| 09 | `09-activity-logger.json` | Central audit log for all DB changes | Webhook `/webhook/activity-log` | ALL tables → activity_log | Supabase |
| 10 | `10-quote-price-calculator.json` | AI price calculator from pricing DB | Webhook `/webhook/price-calc` | pricing_materials, pricing_sheet_sizes, pricing_services, activity_log | Gemini, Supabase |

### Trigger Type Summary
- **Schedule (Daily):** Workflows 03 (8AM), 06 (6AM)
- **Schedule (Weekly):** Workflow 04 (Monday 9AM)
- **Schedule (Monthly):** Workflow 08 (1st 7AM)
- **Schedule (Interval):** Workflow 05 (every 30 min)
- **Webhook (n8n):** Workflows 01, 10
- **Webhook (Supabase DB Webhook → n8n):** Workflows 02, 07, 09

---

## 12. KEY FRONT-END CONSTANTS

### Document Types
```javascript
['Quote', 'Proforma', 'Agreement', 'Order', 'Invoice']
```

### Status Per Type
```javascript
Quote:     ['Draft', 'Sent', 'Approved', 'Revised']
Proforma:  ['Unpaid', 'Paid']
Agreement: ['Draft', 'Signed']
Order:     ['Pending', 'In Production', 'Completed']
Invoice:   ['Draft', 'Sent', 'Paid']
```

### Dashboard KPI Calculations
```javascript
totalQuotes: documents.length
pendingDocs: documents.filter(d => d.status === 'Draft').length
activeOrders: documents.filter(d => d.type === 'Order' && d.status !== 'Completed').length
monthlyRevenue: documents.filter(d => d.status === 'Paid')
                  .reduce((sum, d) => sum + d.grand_total, 0)
```

---

## 13. PACKAGE DEPENDENCIES

```json
{
  "next": "16.2.9",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "@supabase/supabase-js": "^2.109.0",
  "lucide-react": "^1.22.0",
  "recharts": "^3.9.0",
  "html2canvas": "^1.4.1",
  "canvas-confetti": "^1.9.4"
}
```

---

## 14. TROUBLESHOOTING INTEGRATION POINTS

### When n8n calls Supabase REST API:
- Use `service_role` key (not anon) — it bypasses RLS
- Set header `Prefer: return=representation` to get inserted row back
- For upsert: use `POST /table?on_conflict=column_name`
- For update: use `PATCH /table?column=eq.value`

### When n8n calls Gemini API:
- Model: `gemini-2.0-flash` (fast/cheap) or `gemini-2.5-pro` (powerful)
- Always instruct: "Return ONLY valid JSON with NO markdown formatting"
- Clean response in Code node: `text.replace(/```json/g,'').replace(/```/g,'').trim()`

### When n8n sends WhatsApp:
- Use Meta Cloud API v21.0
- Need: Phone Number ID + Permanent Access Token
- Message format: `{ messaging_product: "whatsapp", to: "phone", type: "text", text: { body: "message" } }`

### When n8n sends Email:
- SMTP: Hostinger (mail.pixelwave.lk)
- Port: 465 (SSL) or 587 (TLS)
- From: quotes@pixelwave.lk / billing@pixelwave.lk

---

## 15. FILE STRUCTURE

```
pixelwave-smartquote/
├── app/
│   ├── layout.js                   # Root layout (dark theme, metadata)
│   ├── page.js                     # Main admin SPA (state, routing, handlers)
│   ├── globals.css                 # Global styles + @media print
│   └── secure/
│       └── [id]/
│           └── page.js             # Client portal (public route)
├── components/
│   ├── Sidebar.jsx                 # Navigation (grouped by parent)
│   ├── TopBar.jsx                  # Status bar (supabase, n8n, clock)
│   ├── Dashboard.jsx               # KPI cards + charts (recharts)
│   ├── DocEditor.jsx               # AI Intake chat + document form
│   ├── ClientPortal.jsx            # Client-facing sign/pay/approve
│   ├── N8nWorkflow.jsx             # Visual n8n pipeline simulation
│   ├── ClientsSubscriptions.jsx    # Client + subscription CRUD
│   ├── OperationsCalendar.jsx      # Weekly planner
│   ├── PricingMatrix.jsx           # Materials/sizes/services
│   ├── KanbanBoard.jsx             # Production kanban (work_orders)
│   ├── MarketingHub.jsx            # Campaign management
│   ├── BrandCustomizer.jsx         # Theme customization
│   ├── SupplierTracker.jsx         # Supplier + purchase log
│   ├── PnLTracker.jsx              # P&L (expenses + revenues)
│   └── LoginScreen.jsx             # Auth gate
├── lib/
│   └── supabaseClient.js           # Supabase init (online/offline)
├── data/
│   └── mockDatabase.js             # Seed data + AI presets
├── n8n-workflows/
│   ├── README.md                       # Setup guide + AI assistant instructions
│   ├── PIXELWAVE_API_REFERENCE.md      # ← This file
│   ├── 01-client-inquiry-agent.json
│   ├── 02-document-lifecycle-agent.json
│   ├── 03-payment-followup-agent.json
│   ├── 04-supplier-auto-reorder.json
│   ├── 05-campaign-dispatch-agent.json
│   ├── 06-subscription-billing-agent.json
│   ├── 07-kanban-production-notifier.json
│   ├── 08-monthly-pnl-reporter.json
│   ├── 09-activity-logger.json
│   └── 10-quote-price-calculator.json
├── public/
├── schema.sql                      # Full DB schema
├── test_supabase.mjs               # Connection test script
├── PIXELWAVE_API_REFERENCE.md      # ← This file
└── package.json
```

---

> **Next Steps:** Use this reference with Gemini Pro / Claude Code to:
> 1. Import all 10 n8n workflow JSONs from `n8n-workflows/`
> 2. Connect credentials (Supabase REST, Gemini API, Redis, RabbitMQ, SMTP, WhatsApp)
> 3. Test webhooks from the admin panel (DocEditor AI Intake → n8n → Supabase)
> 4. Enable Supabase Database Webhooks for tables: `quotations`, `work_orders`, and ALL others (for workflows 02, 07, 09)
> 5. Schedule triggers: 03 (Daily 8AM), 04 (Weekly Mon 9AM), 05 (Every 30min), 06 (Daily 6AM), 08 (Monthly 1st 7AM)
> 6. Wire workflow 10 (`/webhook/price-calc`) into DocEditor/PricingMatrix for live price calculation
