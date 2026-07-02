# n8n Workflow Build Guide — PixelWave SmartQuote

Manually build each workflow in n8n v2.23.4+ using this guide.  
All Supabase nodes use **HTTP Request** (generic credentials), **not** Postgres nodes.

---

## Credentials to Create in n8n

| Credential Name | Type | Fields |
|---|---|---|
| `Supabase API` | Generic Credential | `supabaseUrl`, `supabaseApiKey` |
| `Gemini API` | Generic Credential | `geminiApiKey` |
| `SMTP PixelWave` | SMTP | billing@pixelwave.lk |
| `RabbitMQ` | RabbitMQ | connection URL |

> `supabaseUrl` = `https://xxxxx.supabase.co`  
> `supabaseApiKey` = `service_role` key (bypasses RLS)

---

## Workflow 01 — Client Inquiry AI Agent

**Trigger:** Webhook (`POST /webhook/client-inquiry`)  
**Flow:** Webhook → Parse → Gemini → Parse → Find/Upsert Customer → Create Quotation → Create Items (parallel) → Email + RabbitMQ

### Node 1: WhatsApp Webhook
- Type: **Webhook**
- Path: `client-inquiry`
- Options: `rawBody: true`

### Node 2: Parse & Format Inquiry
- Type: **Code** (JavaScript)
- Mode: `Run Once for All Items`
```javascript
const input = $input.first().json;

const rawMessage = input.body || input.message || input.text || input.content || '';
const senderName = input.sender_name || input.name || input.from || 'Unknown';
const senderContact = input.sender_contact || input.phone || input.email || '';
const channel = input.channel || input.source || 'whatsapp';

const now = new Date();
const dateStr = now.getFullYear()
  + String(now.getMonth() + 1).padStart(2, '0')
  + String(now.getDate()).padStart(2, '0');
const rand = String(Math.floor(Math.random() * 9000) + 1000);
const quoteNo = 'PW-' + dateStr + '-' + rand;

const promptText = `You are a smart quoting assistant for a printing/packaging company. Extract quotation details from this client inquiry. Return ONLY valid JSON with NO markdown formatting or code blocks.

{
  "customer_name": "full name",
  "customer_email": "email if found",
  "customer_phone": "phone number",
  "customer_address": "address if found",
  "items": [{"item_title": "service name", "description": "details", "qty": 1, "unit_price": 0}],
  "notes": "any special requests",
  "type": "Quote"
}

If any field is missing, use "" or [] or 0. Do NOT guess prices.

Inquiry: ${rawMessage}
From: ${senderName} (${senderContact})`;

return [{
  raw_message: rawMessage,
  sender_name: senderName,
  sender_contact: senderContact,
  channel: channel,
  quote_no: quoteNo,
  issue_date: now.toISOString().slice(0, 10),
  type: 'Quote',
  status: 'Draft',
  gemini_payload: {
    contents: [{ role: 'user', parts: [{ text: promptText }] }]
  }
}];
```

### Node 3: Gemini - Extract Quote Details
- Type: **HTTP Request**
- Method: POST
- URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- Authentication: Generic Credential → `Gemini API`
- Headers:
  - `Content-Type`: `application/json`
  - `x-goog-api-key`: `={{ $credentials.geminiApiKey }}`
- Body: JSON
  ```
  ={{ $json.gemini_payload }}
  ```
- Timeout: 30000ms

### Node 4: Parse Gemini Response
- Type: **Code** (JavaScript)
- Mode: `Run Once for All Items`
```javascript
const response = $input.first().json;
const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();

let parsed;
try {
  parsed = JSON.parse(clean);
} catch(e) {
  parsed = {
    customer_name: '', customer_email: '', customer_phone: '',
    customer_address: '', items: [], notes: '', type: 'Quote'
  };
}

const items = parsed.items || [];
const subtotal = items.reduce((sum, it) => sum + (it.qty || 0) * (it.unit_price || 0), 0);
const grand_total = subtotal;

return [{
  ...$json,
  customer_name: parsed.customer_name || '',
  customer_email: parsed.customer_email || '',
  customer_phone: parsed.customer_phone || '',
  customer_address: parsed.customer_address || '',
  items: items,
  notes: parsed.notes || '',
  type: parsed.type || 'Quote',
  subtotal: subtotal,
  grand_total: grand_total
}];
```

### Node 5: Supabase - Find Customer
- Type: **HTTP Request**
- Method: GET
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/customers?email=eq.{{ $json.customer_email }}&select=id,name,email,phone,address`
- Authentication: Generic Credential → `Supabase API`
- Headers:
  - `apikey`: `={{ $credentials.supabaseApiKey }}`
  - `Authorization`: `=Bearer {{ $credentials.supabaseApiKey }}`
- Options: Timeout 10000ms

### Node 6: Supabase - Upsert Customer
- Type: **HTTP Request**
- Method: POST
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/customers?on_conflict=email`
- Authentication: Generic Credential → `Supabase API`
- Headers:
  - `apikey`: `={{ $credentials.supabaseApiKey }}`
  - `Authorization`: `=Bearer {{ $credentials.supabaseApiKey }}`
  - `Content-Type`: `application/json`
  - `Prefer`: `resolution=merge-failed`
- Body (JSON Parameters):
  - `name`: `={{ $json.customer_name }}`
  - `email`: `={{ $json.customer_email }}`
  - `phone`: `={{ $json.customer_phone }}`
  - `address`: `={{ $json.customer_address }}`

### Node 7: Supabase - Create Quotation
- Type: **HTTP Request**
- Method: POST
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/quotations`
- Authentication: Generic Credential → `Supabase API`
- Headers:
  - `apikey`: `={{ $credentials.supabaseApiKey }}`
  - `Authorization`: `=Bearer {{ $credentials.supabaseApiKey }}`
  - `Content-Type`: `application/json`
  - `Prefer`: `return=representation`
- Body (JSON Parameters):
  - `quote_no`: `={{ $json.quote_no }}`
  - `customer_id`: `={{ $node['Supabase - Upsert Customer'].json[0]?.id || $node['Supabase - Find Customer'].json[0]?.id }}`
  - `issue_date`: `={{ $json.issue_date }}`
  - `type`: `={{ $json.type }}`
  - `status`: `={{ $json.status }}`
  - `subtotal`: `={{ $json.subtotal }}`
  - `grand_total`: `={{ $json.grand_total }}`
  - `notes`: `={{ $json.notes }}`

### Node 8: Supabase - Create Items
- Type: **HTTP Request**
- Method: POST
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/quotation_items`
- Authentication: Generic Credential → `Supabase API`
- Headers:
  - `apikey`: `={{ $credentials.supabaseApiKey }}`
  - `Authorization`: `=Bearer {{ $credentials.supabaseApiKey }}`
  - `Content-Type`: `application/json`
- Body: JSON (raw expression)
  ```
  ={{ $json.items.map(item => ({
    quotation_id: $node['Supabase - Create Quotation'].json[0]?.id,
    item_title: item.item_title,
    description: item.description,
    quantity: item.qty,
    unit_price: item.unit_price,
    line_total: item.qty * item.unit_price
  })) }}
  ```

### Node 9: Send Email Confirmation
- Type: **Email Send (SMTP)**
- Credential: `SMTP PixelWave`
- From: `billing@pixelwave.lk`
- To: `={{ $node['Parse Gemini Response'].json.customer_email }}`
- Subject: `=New Quote Created: {{ $node['Parse Gemini Response'].json.quote_no }}`
- Text:
  ```
  =Hi {{ $node['Parse Gemini Response'].json.customer_name }},

  We've created a quotation based on your inquiry.

  Quote No: {{ $node['Parse Gemini Response'].json.quote_no }}
  Amount: LKR {{ $node['Parse Gemini Response'].json.grand_total.toLocaleString() }}

  View your quote: https://smartquote.pixelwave.lk/secure/{{ $node['Parse Gemini Response'].json.quote_no }}

  Best regards,
  PixelWave Team
  ```

### Node 10: Queue for Review (RabbitMQ)
- Type: **RabbitMQ**
- Credential: `RabbitMQ`
- Queue: `quotes_pending_review`

### Node 11: Complete
- Type: **NoOp** (do nothing)

### Connections
```
WhatsApp Webhook [0] → Parse & Format Inquiry [0] → Gemini [0] → Parse Gemini Resp [0] → Supabase Find Cust [0]
Supabase Find Cust [0] → Supabase Upsert Cust [0] → Supabase Create Quotation [0]
Supabase Create Quotation [0] → (parallel) → Send Email [0], Supabase Create Items [0]
Supabase Create Items [0] → Queue RabbitMQ [0]
Send Email [0] → Complete [0]
Queue RabbitMQ [0] → Complete [0]
```

---

## Workflow 02 — Document Lifecycle AI Agent

**Trigger:** Supabase Database Webhook (on `quotations` table — INSERT/UPDATE)  
**Flow:** Webhook → Parse → Switch (by status) → Get Customer → Gemini → Parse → Switch (by action) → Create Proforma/Work Order/Mark Paid → Email

### Node 1: Supabase Webhook
- Type: **Webhook**
- Path: `doc-lifecycle`
- Options: `rawBody: true`

### Node 2: Parse Event
- Type: **Code** (JavaScript)
```javascript
const event = $input.first().json;
const record = event.record || event.new || {};
const oldRecord = event.old || {};

return {
  quote_no: record.quote_no,
  type: record.type,
  status: record.status,
  old_status: oldRecord.status,
  customer_id: record.customer_id,
  event_type: event.type || 'UPDATE',
  timestamp: new Date().toISOString()
};
```

### Node 3: Route by New Status
- Type: **Switch**
- Value 1: `={{ $json.status }}`
- Rules:
  - `Approved` → Output 0
  - `Signed` → Output 1
  - `Paid` → Output 2
- Fallback Output: 3

### Node 4: Supabase - Get Customer
- Type: **HTTP Request**
- Method: GET
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/customers?id=eq.{{ $json.customer_id }}&select=name,email,phone`
- Headers:
  - `apikey`: `={{ $credentials.supabaseApiKey }}`
  - `Authorization`: `=Bearer {{ $credentials.supabaseApiKey }}`

### Node 5: Gemini - Decide Next Action
- Type: **HTTP Request**
- Method: POST
- URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- Headers:
  - `Content-Type`: `application/json`
  - `x-goog-api-key`: `={{ $credentials.geminiApiKey }}`
- Body: JSON
  ```
  =[{"role": "user", "parts": [{"text": `Document Lifecycle Manager. Doc {{ $json.quote_no }} status: "{{ $json.status }}". Rules:
  - Approved -> convert_to_proforma, new_type: Proforma, new_status: Unpaid
  - Signed -> convert_to_work_order, new_type: Work Order, new_status: Pending
  - Paid -> mark_as_paid, new_type: keep current, new_status: Paid
  Return ONLY valid JSON, no markdown.

  { "action": "...", "new_type": "...", "new_status": "...", "notes": "Auto-converted" }`}]}]
  ```

### Node 6: Parse Gemini Decision
- Type: **Code** (JavaScript)
```javascript
const response = $input.first().json;
const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
let parsed;
try { parsed = JSON.parse(clean); } catch(e) {
  parsed = { action: 'convert_to_proforma', new_type: 'Proforma', new_status: 'Unpaid', notes: 'Auto-converted' };
}
return { ...$json, ...parsed };
```

### Node 7: Route by Action
- Type: **Switch**
- Value 1: `={{ $json.action }}`
- Rules:
  - `convert_to_proforma` → Output 0
  - `convert_to_work_order` → Output 1
  - `mark_as_paid` → Output 2
- Fallback Output: 3

### Node 8: Supabase - Create Proforma
- Type: **HTTP Request**
- Method: POST
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/quotations`
- Headers:
  - `apikey`: `={{ $credentials.supabaseApiKey }}`
  - `Authorization`: `=Bearer {{ $credentials.supabaseApiKey }}`
  - `Content-Type`: `application/json`
  - `Prefer`: `return=representation`
- Body:
  - `quote_no`: `={{ $json.quote_no + '-PI' }}`
  - `customer_id`: `={{ $json.customer_id }}`
  - `issue_date`: `={{ new Date().toISOString().slice(0,10) }}`
  - `type`: `={{ $json.new_type }}`
  - `status`: `={{ $json.new_status }}`
  - `notes`: `={{ $json.notes }}`

### Node 9: Supabase - Create Work Order
- Type: **HTTP Request**
- Method: POST
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/quotations`
- Headers same as Proforma
- Body:
  - `quote_no`: `={{ $json.quote_no.replace('-AG', '') + '-WO' }}`
  - `customer_id`: `={{ $json.customer_id }}`
  - `issue_date`: `={{ new Date().toISOString().slice(0,10) }}`
  - `type`: `'Order'`
  - `status`: `'In Production'`
  - `notes`: `='Auto-generated from signed Agreement ' + $json.quote_no`

### Node 10: Supabase - Mark as Paid
- Type: **HTTP Request**
- Method: PATCH
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/quotations?quote_no=eq.{{ $json.quote_no }}`
- Headers same
- Body:
  - `status`: `'Paid'`

### Node 11: Queue Production Order
- Type: **RabbitMQ**
- Queue: `production_orders`

### Node 12: Email Client
- Type: **Email Send (SMTP)**
- From: `billing@pixelwave.lk`
- To: `={{ $node['Supabase - Get Customer'].json[0]?.email }}`
- Subject: `=Document {{ $json.quote_no }} - {{ $json.status }}`
- Text:
  ```
  =Hi {{ $node['Supabase - Get Customer'].json[0]?.name }},

  Your document {{ $json.quote_no }} has been updated to {{ $json.status }}.

  View: https://smartquote.pixelwave.lk/secure/{{ $json.quote_no }}

  PixelWave Team
  ```

### Node 13: No Action
- Type: **NoOp**

### Connections
```
Webhook [0] → Parse Event [0] → Route by Status [0/1/2] → Get Customer [0]
Get Customer [0] → Gemini [0] → Parse Gemini [0] → Route by Action [0/1/2/3]
Route by Action [0] → Create Proforma [0] → Email [0]
Route by Action [1] → Create Work Order [0] → Queue RabbitMQ [0] → Email [0]
Route by Action [2] → Mark as Paid [0] → Email [0]
Route by Action [3] → No Action
Route by New Status [3] → No Action
```

---

## Workflow 03 — Payment Follow-up Agent

**Trigger:** Schedule (Daily at 8:00 AM)  
**Flow:** Schedule → Fetch Unpaid → For Each → Check Date → Send Reminder (Email/WhatsApp)

### Node 1: Daily Schedule
- Type: **Schedule Trigger**
- Hours: 8
- Minutes: 0

### Node 2: Supabase - Fetch Unpaid Quotes
- Type: **HTTP Request**
- Method: GET
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/quotations?select=*,customers!inner(name,email,phone,address)&status=eq.Unpaid&order=issue_date.asc`
- Headers: apikey + Authorization

### Node 3: Filter Overdue
- Type: **Code** (JavaScript)
```javascript
const items = $input.all();
const now = new Date();
const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

return items
  .filter(item => new Date(item.json.issue_date) < sevenDaysAgo)
  .map(item => item.json);
```

### Node 4: Has Overdue?
- Type: **IF**
- Condition: `{{ $json.count }}` is empty

### Node 5: Loop Overdue Items
- Type: **SplitInBatches**
- Batch Size: 1

### Node 6: Route by Contact
- Type: **Switch**
- Value 1: `={{ $json.customer_phone && $json.customer_phone.startsWith('+94') ? 'whatsapp' : 'email' }}`
- Rules:
  - `whatsapp` → Output 0
  - `email` → Output 1
- Fallback Output: 1

### Node 7: Send WhatsApp Reminder (placeholder)
- Type: **HTTP Request**
- Method: POST
- URL: `https://graph.facebook.com/v18.0/WHATSAPP_PHONE_ID/messages`
- Headers: Authorization Bearer token
- Body: WhatsApp template message with `{{ $json.quote_no }}` and `{{ $json.grand_total }}`

### Node 8: Send Email Reminder
- Type: **Email Send**
- To: `={{ $json.customer_email }}`
- Subject: `=Payment Reminder: Quote {{ $json.quote_no }}`
- Body: Payment reminder with link

### Node 9: Log Follow-up
- Type: **HTTP Request**
- Method: POST
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/activity_log`
- Body:
  - `action`: `'payment_reminder_sent'`
  - `entity_type`: `'quotation'`
  - `entity_id`: `={{ $json.quote_no }}`
  - `detail`: `='Reminder sent via ' + $json.channel`

### Node 10: No Overdue
- Type: **NoOp**

### Connections
```
Schedule [0] → Fetch Unpaid [0] → Filter Overdue [0] → Has Overdue? [0] → Loop Items [0]
Has Overdue? [1] → No Overdue
Loop Items [0] → Route by Contact [0/1] → Send WhatsApp/Email [0] → Log Follow-up [0]
Loop Items [1] → (back to Loop Items)
```

---

## Workflow 04 — Supplier Auto-Reorder Agent

**Trigger:** Schedule (Weekly Monday 9:00 AM)  
**Flow:** Schedule → Fetch Suppliers → Check Last Order → Gemini Alert → Email + Log

### Node 1: Weekly Schedule
- Type: **Schedule Trigger**
- Days: Monday
- Hour: 9, Minute: 0

### Node 2: Supabase - Fetch Suppliers
- Type: **HTTP Request**
- Method: GET
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/suppliers?select=*,purchase_orders(last_order_date,status)&order=name.asc`
- Headers: apikey + Authorization

### Node 3: Check Inactivity
- Type: **Code** (JavaScript)
```javascript
const items = $input.all();
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

return items
  .filter(item => {
    const orders = item.json.purchase_orders || [];
    const lastDate = orders.length > 0 ? new Date(orders[0].last_order_date) : null;
    return !lastDate || lastDate < thirtyDaysAgo;
  })
  .map(item => item.json);
```

### Node 4: Has Reorders?
- Type: **IF**
- Condition: `{{ $json.count }}` is empty

### Node 5: Gemini - Write Reorder Alert
- Type: **HTTP Request**
- Method: POST
- URL: Gemini API
- Body: Prompt summarizing inactive suppliers

### Node 6: Parse Alert & Log
- Type: **Code** (JavaScript)
```javascript
const response = $input.first().json;
const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
return { ...$json, alert_text: text };
```

### Node 7: Email Reorder Alert
- Type: **Email Send**
- To: `procurement@pixelwave.lk`
- Subject: `=Supplier Reorder Alert - {{ $json.alert_text?.slice(0, 50) }}`

### Node 8: Supabase - Log Activity
- Type: **HTTP Request**
- Method: POST
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/activity_log`
- Body:
  - `action`: `'supplier_reorder_alert'`
  - `entity_type`: `'purchase_order'`
  - `detail`: `={{ $json.alert_text }}`

### Node 9: Skip - No Reorders
- Type: **NoOp**

---

## Workflow 05 — Campaign Dispatch Agent

**Trigger:** Schedule (Every 30 minutes)  
**Flow:** Schedule → Fetch Campaigns → Loop → Send (WhatsApp/Email) → Mark Sent

### Node 1: Every 30 min Schedule
- Type: **Schedule Trigger**
- Interval: 30 minutes

### Node 2: Supabase - Fetch Pending Campaigns
- Type: **HTTP Request**
- Method: GET
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/campaigns?status=eq.Pending&order=created_at.asc`
- Headers: apikey + Authorization

### Node 3: Has Pending Campaigns?
- Type: **IF**
- Condition: `{{ $json.count }}` is empty

### Node 4: Loop Each Campaign
- Type: **SplitInBatches**
- Batch Size: 1

### Node 5: Supabase - Mark Sending
- Type: **HTTP Request**
- Method: PATCH
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/campaigns?id=eq.{{ $json.id }}`
- Body: `status: 'Sending'`

### Node 6: Route by Channel
- Type: **Switch**
- Value 1: `={{ $json.channel }}`
- Rules:
  - `whatsapp` → Output 0
  - `email` → Output 1

### Node 7: Supabase - Fetch Recipients
- Type: **HTTP Request**
- Method: GET
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/customers?select=name,email,phone`
- Headers: apikey + Authorization

### Node 8: Send WhatsApp / Send Email (per recipient)
- WhatsApp: HTTP POST to Facebook Graph API
- Email: Email Send node

### Node 9: Supabase - Mark Sent
- Type: **HTTP Request**
- Method: PATCH
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/campaigns?id=eq.{{ $json.id }}`
- Body: `status: 'Sent'`

### Node 10: No Pending Campaigns
- Type: **NoOp**

---

## Workflow 06 — Subscription Billing Agent

**Trigger:** Schedule (Daily 6:00 AM)  
**Flow:** Schedule → Fetch Active Subs → Check Renewal Dates → Loop → Create Invoice → Create Items → Email + Log

### Node 1: Daily Schedule (6 AM)
- Type: **Schedule Trigger**
- Hour: 6, Minute: 0

### Node 2: Supabase - Fetch Active Subs
- Type: **HTTP Request**
- Method: GET
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/subscriptions?select=*,customers!inner(name,email,phone,address)&status=eq.Active&order=renewal_date.asc`
- Headers: apikey + Authorization

### Node 3: Check Renewal Dates
- Type: **Code** (JavaScript)
```javascript
const items = $input.all();
const today = new Date();
const results = [];

for (const item of items) {
  const data = item.json;
  const renewal = new Date(data.renewal_date);
  const daysUntil = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntil >= 0 && daysUntil <= 3) {
    const customer = data.customers || {};
    const quoteNo = `SUB-${data.id?.slice(0,8)}-${renewal.getFullYear()}${String(renewal.getMonth()+1).padStart(2,'0')}`;
    results.push({
      sub_id: data.id,
      customer_id: data.customer_id,
      customer_name: customer.name || 'Unknown',
      customer_email: customer.email || '',
      customer_phone: customer.phone || '',
      customer_address: customer.address || '',
      plan_name: data.plan_name,
      monthly_fee: parseFloat(data.monthly_fee) || 0,
      renewal_date: data.renewal_date,
      days_until_renewal: daysUntil,
      quote_no: quoteNo,
      issue_date: today.toISOString().slice(0,10),
      type: 'Invoice',
      status: 'Sent'
    });
  }
}
return results.length > 0 ? results : [{ message: 'No renewals due soon', count: 0 }];
```

### Node 4: Has Renewals Due?
- Type: **IF**
- Condition: `{{ $json.count }}` is empty

### Node 5: Loop Each Renewal
- Type: **SplitInBatches**
- Batch Size: 1

### Node 6: Supabase - Create Invoice
- Type: **HTTP Request**
- Method: POST
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/quotations`
- Headers: + `Prefer: return=representation`
- Body:
  - `quote_no`: `={{ $json.quote_no }}`
  - `customer_id`: `={{ $json.customer_id }}`
  - `issue_date`: `={{ $json.issue_date }}`
  - `type`: `'Invoice'`
  - `status`: `'Sent'`
  - `subtotal`: `={{ $json.monthly_fee }}`
  - `grand_total`: `={{ $json.monthly_fee }}`
  - `notes`: `='Auto-billing: ' + $json.plan_name + ' subscription renewal'`
  - `currency`: `'LKR'`

### Node 7: Supabase - Create Invoice Item
- Type: **HTTP Request**
- Method: POST
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/quotation_items`
- Headers: apikey + Authorization
- Body: JSON (raw)
  ```
  =[{
    quotation_id: $node['Supabase - Create Invoice'].json[0]?.id,
    item_title: 'Subscription: ' + $json.plan_name,
    description: 'Monthly subscription renewal for ' + $json.plan_name,
    quantity: 1,
    unit_price: $json.monthly_fee,
    line_total: $json.monthly_fee
  }]
  ```

### Node 8: Email Invoice to Client
- Type: **Email Send**
- To: `={{ $json.customer_email }}`
- Subject: `=Your Subscription Invoice - {{ $json.quote_no }}`
- Body: Include quote_no, amount, due date

### Node 9: Supabase - Log Billing
- Type: **HTTP Request**
- Method: POST
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/activity_log`
- Body:
  - `action`: `'subscription_invoice_created'`
  - `entity_type`: `'subscription'`
  - `entity_id`: `={{ $json.sub_id }}`
  - `detail`: `='Auto-billing invoice ' + $json.quote_no + ' for ' + $json.customer_name`

### Node 10: No Renewals Due
- Type: **NoOp**

### Connections
```
Schedule [0] → Fetch Subs [0] → Check Dates [0] → Has Renewals? [0] → Loop [0]
Has Renewals? [1] → No Renewals
Loop [0] → Create Invoice [0] → (parallel) → Create Invoice Item [0], Email Client [0]
Create Invoice Item [0] → Log Billing [0]
Loop [1] → (back to Loop)
```

---

## Workflow 07 — Kanban Production Notifier

**Trigger:** Webhook (from Kanban column move)  
**Flow:** Webhook → Route Column → Gemini → Parse → Email + Log

### Node 1: Kanban Webhook
- Type: **Webhook**
- Path: `kanban-move`

### Node 2: Parse Move Event
- Type: **Code** (JavaScript)
```javascript
const event = $input.first().json;
return {
  order_id: event.id || event.order_id,
  quote_no: event.quote_no || '',
  from_column: event.from || event.old_column || '',
  to_column: event.to || event.new_column || '',
  team: event.team || 'Production',
  timestamp: new Date().toISOString()
};
```

### Node 3: Route by Column Move
- Type: **Switch**
- Value 1: `={{ $json.to_column }}`
- Rules:
  - `In Production` → Output 0
  - `Quality Check` → Output 1
  - `Ready to Ship` → Output 2
  - `Shipped` → Output 3
- Fallback: 4

### Node 4: Gemini - Generate Notification
- Type: **HTTP Request**
- URL: Gemini API
- Body: Prompt with quote_no + from/to columns + team

### Node 5: Parse Notification
- Type: **Code** (JavaScript)
```javascript
const response = $input.first().json;
const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
return { ...$json, notification: text };
```

### Node 6: Email Team Notification
- Type: **Email Send**
- To: `={{ $json.team }}@pixelwave.lk`
- Subject: `=Kanban Move: {{ $json.quote_no }} → {{ $json.to_column }}`

### Node 7: Supabase - Log Kanban Event
- Type: **HTTP Request**
- Method: POST
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/activity_log`
- Body:
  - `action`: `='kanban_moved_to_' + $json.to_column.replace(/\s+/g, '_')`
  - `entity_type`: `'work_order'`
  - `entity_id`: `={{ $json.quote_no }}`

### Node 8: No Action
- Type: **NoOp**

---

## Workflow 08 — Monthly P&L Reporter

**Trigger:** Schedule (1st of month, 7:00 AM)  
**Flow:** Schedule → Fetch Revenues & Expenses → Calculate → Gemini Summary → Email + Log

### Node 1: Monthly Schedule
- Type: **Schedule Trigger**
- Day: 1, Hour: 7, Minute: 0

### Node 2: Supabase - Fetch Revenues
- Type: **HTTP Request**
- Method: GET
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/quotations?type=eq.Invoice&status=eq.Paid&select=grand_total,issue_date`
- Headers: apikey + Authorization

### Node 3: Supabase - Fetch Expenses
- Type: **HTTP Request**
- Method: GET
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/purchase_orders?select=total,order_date`
- Headers: apikey + Authorization

### Node 4: Calculate Previous Month
- Type: **Code** (JavaScript)
```javascript
const now = new Date();
const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const monthStart = prevMonth.toISOString().slice(0, 7);
const invoices = $input.all()[0]?.json || [];
const expenses = $input.all()[1]?.json || [];

const totalRevenue = invoices
  .filter(inv => inv.issue_date?.startsWith(monthStart))
  .reduce((sum, inv) => sum + (parseFloat(inv.grand_total) || 0), 0);

const totalExpenses = expenses
  .filter(exp => exp.order_date?.startsWith(monthStart))
  .reduce((sum, exp) => sum + (parseFloat(exp.total) || 0), 0);

return [{
  month: monthStart,
  total_revenue: totalRevenue,
  total_expenses: totalExpenses,
  net_profit: totalRevenue - totalExpenses,
  profit_margin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(2) : 0
}];
```

### Node 5: Gemini - Write P&L Summary
- Type: **HTTP Request**
- URL: Gemini API
- Body: Prompt with revenue, expenses, net_profit, profit_margin

### Node 6: Parse Report & Save
- Type: **Code** (JavaScript)
```javascript
const response = $input.first().json;
const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
return { ...$json, summary_text: text };
```

### Node 7: Email P&L Report
- Type: **Email Send**
- To: `finance@pixelwave.lk`
- Subject: `=Monthly P&L Report - {{ $json.month }}`

### Node 8: Supabase - Log Report
- Type: **HTTP Request**
- Method: POST
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/activity_log`
- Body:
  - `action`: `'monthly_pnl_report'`
  - `detail`: `='P&L ' + $json.month + ': Rev ' + $json.total_revenue + ', Exp ' + $json.total_expenses`

---

## Workflow 09 — Activity Logger

**Trigger:** Supabase Database Webhook (all tables)  
**Flow:** Webhook → Parse → Insert into activity_log

### Node 1: Database Webhook
- Type: **Webhook**
- Path: `activity-log`

### Node 2: Parse & Format Log
- Type: **Code** (JavaScript)
```javascript
const event = $input.first().json;
const table = event.table || event.type?.split(':')[0] || 'unknown';
const record = event.record || event.new || {};
const oldRecord = event.old || {};

let action = event.action || event.type || 'UNKNOWN';
let detail = '';

if (event.type === 'INSERT') {
  action = table + '_created';
  detail = 'New ' + table + ' record: ' + JSON.stringify(record).slice(0, 200);
} else if (event.type === 'UPDATE') {
  action = table + '_updated';
  detail = 'Updated ' + table + ': ' + JSON.stringify(record).slice(0, 200);
} else if (event.type === 'DELETE') {
  action = table + '_deleted';
  detail = 'Deleted ' + table + ' record';
}

return [{
  action: action,
  entity_type: table,
  entity_id: record.id || record.quote_no || record.email || 'unknown',
  detail: detail,
  created_at: new Date().toISOString()
}];
```

### Node 3: Supabase - Insert Log
- Type: **HTTP Request**
- Method: POST
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/activity_log`
- Body: Send all fields from Code node

---

## Workflow 10 — Quote Price Calculator

**Trigger:** Webhook (`POST /webhook/price-calc`)  
**Flow:** Webhook → Fetch from pricing DB → Calculate → Return response

### Node 1: Price Calculator Webhook
- Type: **Webhook**
- Path: `price-calc`
- Options: `rawBody: true`, `responseMode: lastNode`

### Node 2: Parse Request
- Type: **Code** (JavaScript)
```javascript
const input = $input.first().json;
const body = input.body || input;

return [{
  service_type: body.service_type || body.type || '',
  dimensions: body.dimensions || { width: 0, height: 0, depth: 0 },
  quantity: parseInt(body.quantity) || 1,
  material: body.material || 'standard',
  finish: body.finish || 'matte',
  print_colors: body.print_colors || '4/0',
  customer_email: body.customer_email || ''
}];
```

### Node 3: Supabase - Fetch Pricing Rules
- Type: **HTTP Request**
- Method: GET
- URL: `={{ $credentials.supabaseUrl }}/rest/v1/pricing_rules?type=eq.{{ $json.service_type }}&material=eq.{{ $json.material }}`
- Headers: apikey + Authorization

### Node 4: Calculate Price
- Type: **Code** (JavaScript)
```javascript
const pricingData = $input.all();
const rules = pricingData.length > 0 ? pricingData[0].json : null;
const input = $json;

let unitPrice = 0;
let totalPrice = 0;
let setupCost = 0;

if (rules) {
  unitPrice = parseFloat(rules.unit_price) || 0;
  setupCost = parseFloat(rules.setup_cost) || 0;
  const qty = input.quantity || 1;
  totalPrice = (unitPrice * qty) + setupCost;
} else {
  // Fallback: estimate based on typical rates
  unitPrice = 150;
  totalPrice = unitPrice * (input.quantity || 1) + 2500;
}

return [{
  service_type: input.service_type,
  quantity: input.quantity,
  unit_price: unitPrice,
  setup_cost: setupCost,
  total_price: totalPrice,
  currency: 'LKR',
  estimated_delivery: '5-7 business days',
  notes: rules ? 'Based on standard pricing' : 'Estimated pricing (custom quote required)'
}];
```

### Node 5: Return Response
- Type: **Respond to Webhook**
- Respond with: JSON of the calculated price

---

## Supabase Database Webhook Setup

For workflows 02 (Document Lifecycle) and 09 (Activity Log):

1. Go to Supabase → Database → Webhooks
2. Create new webhook:
   - **Workflow 02**: Table `quotations`, Events: INSERT, UPDATE
   - **Workflow 09**: Tables: all business tables, Events: INSERT, UPDATE, DELETE
3. URL: `https://n8n.pixelwave.lk/webhook/{webhook-path}`
4. HTTP Method: POST
5. Headers: `Content-Type: application/json`

---

## Schedule Triggers Setup

| Workflow | Cron Expression | n8n Schedule |
|---|---|---|
| 03 | `0 8 * * *` | Daily, Hour 8, Minute 0 |
| 04 | `0 9 * * 1` | Weekly Monday, Hour 9 |
| 05 | `*/30 * * * *` | Every 30 min |
| 06 | `0 6 * * *` | Daily, Hour 6, Minute 0 |
| 08 | `0 7 1 * *` | Monthly Day 1, Hour 7 |

---

## Common Supabase HTTP Headers

All Supabase HTTP Request nodes need:
```json
{
  "apikey": "={{ $credentials.supabaseApiKey }}",
  "Authorization": "=Bearer {{ $credentials.supabaseApiKey }}"
}
```

Add `Content-Type: application/json` when sending body.  
Add `Prefer: return=representation` when you need the inserted/updated record back.
