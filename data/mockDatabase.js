// Mock Database for PixelWave SmartQuote SaaS Platform
// Seed data containing initial Documents across PixelWave's service portfolio:
// Packaging Design, Product Development, Digital/Offset/Screen/Laser Printing, Business Automation.

export const initialDocuments = [
  {
    id: "PW-2026-0042",
    quote_no: "PW-2026-0042",
    customer_name: "Topleaf Plantations Pvt Ltd",
    customer_email: "info@topleafceylon.com",
    customer_phone: "+94 77 123 4567",
    customer_address: "No. 45, Kandy Road, Colombo 10, Sri Lanka",
    issue_date: "2026-06-28",
    type: "Quote",
    status: "Draft",
    subtotal: 30000.00,
    discount_percentage: 0.00,
    tax_percentage: 0.00,
    grand_total: 30000.00,
    notes: "Client requested vinyl finish options for packaging labels. Eco-friendly biodegradable pouch.",
    terms: "1. 50% advance payment required upon Proforma Invoice confirmation.\n2. Standard delivery is 10 working days from design approval.\n3. Design files remain the intellectual property of PixelWave until full settlement.",
    items: [
      {
        id: "item-1",
        item_title: "Topleaf Cinnamon Pouch Label Design",
        description: "Premium Ceylon Cinnamon Pouch front & back label design. Dynamic typography, realistic product mockups, and printing plate alignment vectors.",
        qty: 1,
        unit_price: 30000.00,
        line_total: 30000.00
      }
    ]
  },
  {
    id: "PW-2026-0041",
    quote_no: "PW-2026-0041",
    customer_name: "Green Field Tea Exporters",
    customer_email: "purchasing@greenfield.lk",
    customer_phone: "+94 11 255 8899",
    customer_address: "102/B, Industrial Zone, Biyagama, Sri Lanka",
    issue_date: "2026-06-15",
    type: "Quote",
    status: "Approved",
    subtotal: 150000.00,
    discount_percentage: 5.00,
    tax_percentage: 2.00,
    grand_total: 145350.00,
    notes: "Approved by client via WhatsApp. Proceeding to Proforma Invoice generation.",
    terms: "Standard commercial printing terms apply. 2% NBT + custom offset board surcharge factored.",
    items: [
      {
        id: "item-2",
        item_title: "Premium Cardboard Tea Packaging Boxes",
        description: "Custom structural design, double-wall corrugated cardboard box with matte lamination, 4-color offset printing.",
        qty: 500,
        unit_price: 300.00,
        line_total: 150000.00
      }
    ]
  },
  {
    id: "PW-2026-0040",
    quote_no: "PW-2026-0040",
    customer_name: "TechStart Hub (Asia)",
    customer_email: "accounts@techstart.asia",
    customer_phone: "+94 77 987 6543",
    customer_address: "Level 4, Hatch Works, Colombo 01, Sri Lanka",
    issue_date: "2026-06-10",
    type: "Agreement",
    status: "Signed",
    subtotal: 450000.00,
    discount_percentage: 10.00,
    tax_percentage: 0.00,
    grand_total: 405000.00,
    notes: "Agreement signed digitally by CEO. Integration live. n8n automation webhook synced.",
    terms: "Monthly SLA active. Webhook integration hosted on secure VPS. Standard n8n updates supported.",
    items: [
      {
        id: "item-3",
        item_title: "AI Powered n8n CRM Integration & Lead Sync",
        description: "Custom n8n workflow connecting Google Sheets, Facebook Lead Ads, and HubSpot CRM with advanced Gemini Node parsing and notification routes.",
        qty: 1,
        unit_price: 350000.00,
        line_total: 350000.00
      },
      {
        id: "item-4",
        item_title: "AI Agent Node Custom Tool Setup",
        description: "Developing specialized tools in n8n for fetching pricing metrics and running regulatory checks via custom APIs.",
        qty: 1,
        unit_price: 100000.00,
        line_total: 100000.00
      }
    ]
  },
  {
    id: "PW-2026-0039",
    quote_no: "PW-2026-0039",
    customer_name: "Apex Merchandise",
    customer_email: "orders@apexmerch.com",
    customer_phone: "+94 71 456 7890",
    customer_address: "54, Galle Road, Colombo 03, Sri Lanka",
    issue_date: "2026-06-05",
    type: "Order",
    status: "In Production",
    subtotal: 180000.00,
    discount_percentage: 0.00,
    tax_percentage: 5.00,
    grand_total: 189000.00,
    notes: "Screen printing. High-density plastisol ink. Client provided vector artwork. Screen prep completed.",
    terms: "100% advance due to custom fabric sourcing requirements.",
    items: [
      {
        id: "item-5",
        item_title: "Custom Screen Printed Brand T-Shirts",
        description: "200 GSM organic cotton t-shirts, chest and back print using premium metallic plastisol ink.",
        qty: 200,
        unit_price: 900.00,
        line_total: 180000.00
      }
    ]
  },
  {
    id: "PW-2026-0038",
    quote_no: "PW-2026-0038",
    customer_name: "Lanka Crafted Gifts",
    customer_email: "lankacrafted@outlook.com",
    customer_phone: "+94 11 502 2011",
    customer_address: "Artisanal Village, Battaramulla, Sri Lanka",
    issue_date: "2026-05-28",
    type: "Invoice",
    status: "Paid",
    subtotal: 85000.00,
    discount_percentage: 0.00,
    tax_percentage: 0.00,
    grand_total: 85000.00,
    notes: "Laser engraving completed and shipped. Paid via credit card checkout.",
    terms: "Completed project. Archive active.",
    items: [
      {
        id: "item-6",
        item_title: "Laser Engraved Custom Wooden Journals",
        description: "Precision fiber laser engraving of corporate logo on eco-friendly bamboo hard cover journals.",
        qty: 100,
        unit_price: 850.00,
        line_total: 85000.00
      }
    ]
  }
];

export const mockAIIntakePresets = [
  {
    id: "preset-1",
    title: "Packaging Design (WhatsApp)",
    service: "Packaging Design",
    channel: "WhatsApp",
    sender: "Topleaf Cinnamon (Dilhan)",
    rawMessage: `Hi PixelWave, api cinnamon pouch label design ekak karaganna oni. Front and back design dekama oni. Brand name eka 'Topleaf Ceylon Cinnamon'. Premium look ekak thiyenna oni, golden finish and dark design ekakata. Qty 1i design ekata, price eka keeyak wage weida? Terms: 50% advance and 10 working days delivery okay da? Address eka: No. 45, Kandy Road, Colombo 10. email is info@topleafceylon.com. Please quote.`,
    parsedOutput: {
      customer_name: "Topleaf Ceylon Cinnamon",
      customer_email: "info@topleafceylon.com",
      customer_phone: "+94 77 123 4567",
      customer_address: "No. 45, Kandy Road, Colombo 10, Sri Lanka",
      notes: "Client requested premium look with golden finish and dark layout for Ceylon Cinnamon pouch labels.",
      terms: "1. 50% advance payment required.\n2. Delivery within 10 working days from design approval.\n3. Design files intellectual property remains with PixelWave.",
      items: [
        {
          item_title: "Topleaf Cinnamon Pouch Label Design",
          description: "Premium Ceylon Cinnamon Pouch label design (Front & Back). Dark aesthetic with custom gold foil layout templates.",
          qty: 1,
          unit_price: 30000.00
        }
      ]
    }
  },
  {
    id: "preset-2",
    title: "Screen Printing (Email)",
    service: "Screen Printing",
    channel: "Email",
    sender: "Apex Merchandise (Kamal)",
    rawMessage: `Dear PixelWave Team,
    
We want to print custom branded t-shirts for our staff event.
Quantity: 200 T-Shirts.
Specs: 200 GSM Cotton, Black color. Graphic printed on front and back using metallic plastisol screen printing.
Please quote the price per shirt. We need this within 15 days. Budget is around 900 LKR per shirt.
Our contact number is +94 71 456 7890. Email: orders@apexmerch.com. Address: 54, Galle Road, Colombo 03.
    
Best regards,
Kamal - Apex Merchandise`,
    parsedOutput: {
      customer_name: "Apex Merchandise",
      customer_email: "orders@apexmerch.com",
      customer_phone: "+94 71 456 7890",
      customer_address: "54, Galle Road, Colombo 03, Sri Lanka",
      notes: "Screen printed black cotton staff event t-shirts. Metallic plastisol ink prep included.",
      terms: "100% advance due to custom fabric sourcing constraints. Delivery in 15 days.",
      items: [
        {
          item_title: "Custom Screen Printed Brand T-Shirts (Black)",
          description: "200 GSM cotton black crewnecks with front and back logo screen printing in premium metallic ink.",
          qty: 200,
          unit_price: 900.00
        }
      ]
    }
  },
  {
    id: "preset-3",
    title: "n8n Workflow Automation (WhatsApp)",
    service: "Business Automation",
    channel: "WhatsApp",
    sender: "TechStart Hub (Nipuni)",
    rawMessage: `Hi, api n8n system automation ekak setup karanna baluwe. Webhook ekak haraha Facebook Lead Ads lead sync ekak set karanna oni Google Sheets and HubSpot CRM ekata. AI parsing setup ekakuth node ekak widiyata daanna oni Gemini modal eken names & emails parse karala clear db record ekak hadanna. Total integration price and tool configuration ekata quote ekak ewanna. info: accounts@techstart.asia, call Nipuni at +94 77 987 6543, Hatch Colombo 01.`,
    parsedOutput: {
      customer_name: "TechStart Hub (Asia)",
      customer_email: "accounts@techstart.asia",
      customer_phone: "+94 77 987 6543",
      customer_address: "Level 4, Hatch Works, Colombo 01, Sri Lanka",
      notes: "Custom n8n workflow integration for Facebook Lead Ads lead sync to Sheets and HubSpot. Includes custom Gemini node AI parser configuration.",
      terms: "1. 50% advance, 50% on n8n staging deployment.\n2. 30 days active SLA support included.\n3. Hosting configuration to be provided by client.",
      items: [
        {
          item_title: "AI Powered n8n CRM Integration & Lead Sync",
          description: "Deploying n8n workflows mapping Facebook Lead Ads to HubSpot and Google Sheets with logic paths.",
          qty: 1,
          unit_price: 350000.00
        },
        {
          item_title: "AI Agent Node Custom Tool Setup",
          description: "Configuring n8n Advanced AI Nodes with Gemini API for raw contact data entity extraction.",
          qty: 1,
          unit_price: 100000.00
        }
      ]
    }
  },
  {
    id: "preset-4",
    title: "Laser Engraving (Email)",
    service: "Laser Engraving",
    channel: "Email",
    sender: "Lanka Crafted Gifts",
    rawMessage: `Hello,
We need to laser engrave our company logo on 100 units of Bamboo Wooden Journals.
Please let us know the price per engraving unit. We already have the bamboo journals ready. We just need your laser engraving machine run.
Contact: lankacrafted@outlook.com, Tel: +94 11 502 2011. Address: Artisanal Village, Battaramulla.
Thanks,
Lanka Crafted Team`,
    parsedOutput: {
      customer_name: "Lanka Crafted Gifts",
      customer_email: "lankacrafted@outlook.com",
      customer_phone: "+94 11 502 2011",
      customer_address: "Artisanal Village, Battaramulla, Sri Lanka",
      notes: "Precision fiber laser engraving runs on customer-supplied wooden bamboo journals.",
      terms: "Full payment upon pickup. Deliveries to be handled by customer.",
      items: [
        {
          item_title: "Laser Engraved Custom Wooden Journals",
          description: "High precision logo engraving run on bamboo wooden covers. Vector logo calibration included.",
          qty: 100,
          unit_price: 850.00
        }
      ]
    }
  }
];
