import React, { useState, useCallback, useEffect } from 'react';
import {
  Package, Palette, Shirt, Zap, Code2, DollarSign,
  Save, Sparkles, RefreshCw, Send, ChevronRight,
  Info, Plus, Minus, Calculator
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabaseClient';

// ─── DATA CONSTANTS ──────────────────────────────────────────────────────────

const MATERIALS = [
  { id: 'grey-back',    label: 'Box Board (Grey Back)',  costPerSheet: 85,  gsm: '350–400',  note: 'Standard grey-back packaging board' },
  { id: 'ivory-back',   label: 'Ivory Back Board',       costPerSheet: 120, gsm: '300–350',  note: 'Premium cream one-side coated' },
  { id: 'white-back',   label: 'White Back Board',       costPerSheet: 140, gsm: '300–400',  note: 'White both sides, high quality' },
  { id: 'artboard',     label: 'Artboard',               costPerSheet: 160, gsm: '350–400',  note: 'Premium art board — offset quality' },
  { id: 'art-paper',    label: 'Art Paper',              costPerSheet: 65,  gsm: '130–200',  note: 'Coated gloss / matte art paper' },
  { id: 'ice-gold',     label: 'Ice Gold',               costPerSheet: 280, gsm: 'Specialty', note: 'Metallic gold premium specialty' },
  { id: 'ice-silver',   label: 'Ice Silver',             costPerSheet: 280, gsm: 'Specialty', note: 'Metallic silver premium specialty' },
  { id: 'special',      label: 'Special Board',          costPerSheet: 350, gsm: 'Custom',    note: 'Custom premium substrates' },
];

const SHEET_SIZES = [
  { id: 's1', label: '30 × 21 inch',  area: 630,   mult: 1.0,  note: 'A3+ standard offset' },
  { id: 's2', label: '43 × 31 inch',  area: 1333,  mult: 1.85, note: 'SRA3 large format' },
  { id: 's3', label: '40 × 25 inch',  area: 1000,  mult: 1.45, note: 'Custom large format' },
  { id: 's4', label: '13 × 19 inch',  area: 247,   mult: 0.55, note: 'A3 borderless digital' },
  { id: 's5', label: '12 × 18 inch',  area: 216,   mult: 0.50, note: 'Small format digital' },
];

const FINISHINGS = [
  { id: 'gloss-lam',   label: 'Gloss Lamination',    cost: 8  },
  { id: 'matte-lam',   label: 'Matte Lamination',     cost: 10 },
  { id: 'uv-spot',     label: 'UV Spot Varnish',      cost: 15 },
  { id: 'die-cut',     label: 'Die Cut',              cost: 12 },
  { id: 'foil-gold',   label: 'Gold Foil Stamp',      cost: 25 },
  { id: 'foil-silver', label: 'Silver Foil Stamp',    cost: 25 },
  { id: 'emboss',      label: 'Embossing',            cost: 18 },
  { id: 'peel-reveal', label: 'Peel & Reveal',        cost: 22 },
];

const DESIGN_SERVICES = [
  { label: 'Logo Design',             unit: 'Package',   rate: 15000 },
  { label: 'Brand Identity Kit',      unit: 'Project',   rate: 35000 },
  { label: 'Packaging Artwork',       unit: 'Per SKU',   rate: 8000  },
  { label: 'Social Media Post',       unit: 'Per post',  rate: 2500  },
  { label: 'Social Media Bundle',     unit: '10 posts',  rate: 20000 },
  { label: 'Brochure / Leaflet',      unit: 'Per page',  rate: 4500  },
  { label: 'Business Card',           unit: 'Per design',rate: 3000  },
  { label: 'Product Label',           unit: 'Per design',rate: 5000  },
  { label: 'Banner / Standee',        unit: 'Per design',rate: 4000  },
];

const SCREEN_SERVICES = [
  { label: 'Screen Setup (per color)', unit: 'Screen',  rate: 1500 },
  { label: 'T-Shirt Print (1 color)',  unit: 'Per unit', rate: 150  },
  { label: 'T-Shirt Print (2 color)',  unit: 'Per unit', rate: 220  },
  { label: 'T-Shirt Print (4 color)',  unit: 'Per unit', rate: 350  },
  { label: 'Tote Bag Print',           unit: 'Per unit', rate: 180  },
  { label: 'Fabric Blank (200 GSM)',   unit: 'Per unit', rate: 600  },
];

const LASER_SERVICES = [
  { label: 'Laser Engraving (wood)',    unit: 'Per min',  rate: 50  },
  { label: 'Laser Engraving (acrylic)', unit: 'Per min',  rate: 65  },
  { label: 'Laser Engraving (leather)', unit: 'Per min',  rate: 55  },
  { label: 'Laser Engraving (metal)',   unit: 'Per min',  rate: 80  },
  { label: 'Laser Cutting (wood)',      unit: 'Per min',  rate: 60  },
  { label: 'Setup & Artwork Prep',      unit: 'Fixed',    rate: 1500},
];

const N8N_SERVICES = [
  { label: 'n8n Workflow Setup',         unit: 'Per flow', rate: 15000 },
  { label: 'Custom Dev (hourly SLA)',    unit: 'Per hour', rate: 8000  },
  { label: 'AI Agent Integration',       unit: 'Per node', rate: 12000 },
  { label: 'Website Development',        unit: 'Project',  rate: 85000 },
  { label: 'SaaS Monthly Retainer',      unit: 'Per month',rate: 25000 },
  { label: 'Supabase DB Setup',          unit: 'Project',  rate: 18000 },
  { label: 'API Integration',            unit: 'Per API',  rate: 10000 },
  { label: 'Hosting + DNS Setup',        unit: 'Setup',    rate: 5000  },
];

const CURRENCIES = [
  { code: 'LKR', symbol: 'Rs.', rate: 1 },
  { code: 'USD', symbol: '$',   rate: 0.003 },
  { code: 'AED', symbol: 'د.إ',  rate: 0.011 },
];

// ─── SERVICE TABS ─────────────────────────────────────────────────────────────

const SERVICE_TABS = [
  { id: 'board',   label: 'Board Printing',  Icon: Package  },
  { id: 'design',  label: 'Graphic Design',  Icon: Palette  },
  { id: 'screen',  label: 'Screen Printing', Icon: Shirt    },
  { id: 'laser',   label: 'Laser Engraving', Icon: Zap      },
  { id: 'dev',     label: 'n8n / Web Dev',   Icon: Code2    },
];

// ─── HELPER ───────────────────────────────────────────────────────────────────

const fmt = (n, currency) => {
  const converted = n * currency.rate;
  return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function ServiceRateTable({ services, markup, currency, onSendToDocBuilder }) {
  const [qtys, setQtys] = useState(() => Object.fromEntries(services.map((_, i) => [i, 1])));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 pb-1 border-b border-slate-850">
        <div className="col-span-4">Service</div>
        <div className="col-span-2 text-center">Unit</div>
        <div className="col-span-2 text-right">Base Rate</div>
        <div className="col-span-2 text-center">Qty</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      {services.map((svc, i) => {
        const qty = qtys[i];
        const lineTotal = Math.round(svc.rate * (1 + markup / 100) * qty);
        return (
          <div key={i} className="grid grid-cols-12 items-center bg-slate-950/30 px-3 py-2.5 rounded-xl border border-slate-850 hover:border-slate-750 transition-colors group">
            <div className="col-span-4">
              <p className="text-[13px] font-semibold text-slate-200 group-hover:text-brand-cyan transition-colors">{svc.label}</p>
            </div>
            <div className="col-span-2 text-center">
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">{svc.unit}</span>
            </div>
            <div className="col-span-2 text-right">
              <span className="text-[11px] font-mono text-slate-400">{fmt(svc.rate, currency)}</span>
            </div>
            <div className="col-span-2 flex justify-center items-center gap-1.5">
              <button onClick={() => setQtys(q => ({ ...q, [i]: Math.max(1, (q[i] || 1) - 1) }))} className="w-5 h-5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 flex items-center justify-center transition-colors">
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="text-[13px] font-mono text-slate-200 w-6 text-center">{qty}</span>
              <button onClick={() => setQtys(q => ({ ...q, [i]: (q[i] || 1) + 1 }))} className="w-5 h-5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 flex items-center justify-center transition-colors">
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="col-span-2 flex justify-end items-center gap-2">
              <span className="text-[13px] font-bold font-mono text-white">{fmt(lineTotal, currency)}</span>
              <button 
                onClick={() => onSendToDocBuilder({ title: svc.label, unit: svc.unit, rate: lineTotal, qty })}
                className="opacity-0 group-hover:opacity-100 p-1 rounded bg-brand-blue/20 border border-brand-blue/30 text-brand-cyan transition-all"
                title="Send to Doc Builder"
              >
                <Send className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── BOARD PRINTING CALCULATOR ────────────────────────────────────────────────

function BoardPrintingCalc({ materials, sheetSizes, finishings, markup, currency, onSendToDocBuilder, isDark = true }) {
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0]);
  const [selectedSize, setSelectedSize]         = useState(sheetSizes[0]);

  useEffect(() => {
    if (materials && materials.length > 0) {
      setSelectedMaterial(prev => prev && materials.some(m => m.id === prev.id) ? materials.find(m => m.id === prev.id) : materials[0]);
    }
  }, [materials]);

  useEffect(() => {
    if (sheetSizes && sheetSizes.length > 0) {
      setSelectedSize(prev => prev && sheetSizes.some(s => s.id === prev.id) ? sheetSizes.find(s => s.id === prev.id) : sheetSizes[0]);
    }
  }, [sheetSizes]);
  const [qty, setQty]                           = useState(500);
  const [colors, setColors]                     = useState(4);
  const [selectedFinishing, setSelectedFinishing] = useState([]);
  const [isOptimizing, setIsOptimizing]         = useState(false);
  const [aiReport, setAiReport]                 = useState('');

  const toggleFinishing = (id) => {
    setSelectedFinishing(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  // Calculations
  const materialCostPerSheet = (selectedMaterial?.costPerSheet || 0) * (selectedSize?.mult || 1);
  const colorSetupCost       = colors * 1200; // LKR per color plate
  const finishingCostPerUnit = selectedFinishing.reduce((sum, fId) => {
    const f = finishings.find(f => f.id === fId);
    return sum + (f ? f.cost : 0);
  }, 0);
  const printRunCost         = qty * 2.5 * colors;               // ink + press time
  const materialTotalCost    = Math.ceil(qty / 8) * materialCostPerSheet; // ~8 units per sheet
  const baseCost             = colorSetupCost + printRunCost + materialTotalCost + (finishingCostPerUnit * qty);
  const baseCostPerUnit      = baseCost / qty;
  const retailUnit           = baseCostPerUnit * (1 + markup / 100);
  const grandTotal           = retailUnit * qty;

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setAiReport(`💡 [Gemini Pricing] For ${selectedMaterial?.label || 'selected board'} with ${colors}-color offset printing on ${qty} units: Market benchmark in Colombo is ${fmt(retailUnit * 1.15, currency)}/unit. Your current rate is competitive. Consider adding foil stamp upsell (+${fmt(finishingCostPerUnit + 25, currency)}/unit) to premium customers.`);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Material Picker */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Paper / Board Material</label>
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {materials.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMaterial(m)}
                className={`p-3 rounded-xl border transition-all text-left group
                  ${selectedMaterial?.id === m.id
                  ? `bg-brand-blue/10 border-brand-blue ${isDark ? 'text-white' : 'text-brand-blue'}`
                  : `border-transparent hover:border-slate-800 ${isDark ? 'bg-slate-950/20 text-slate-400 hover:bg-slate-900' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200'}`
                }`}
              >
                <div>
                  <p className="text-[13px] font-bold">{m.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{m.gsm} GSM — {m.note}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right controls */}
        <div className="space-y-4">
          {/* Sheet Size */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Full Sheet Size</label>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {sheetSizes.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSize(s)}
                  className={`p-2.5 rounded-xl border transition-all text-left font-mono
                    ${selectedSize?.id === s.id
                    ? `bg-brand-blue/10 border-brand-blue ${isDark ? 'text-white' : 'text-brand-blue'}`
                    : `border-transparent hover:border-slate-800 ${isDark ? 'bg-slate-950/20 text-slate-400 hover:bg-slate-900' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200'}`
                  }`}
                >
                  <span className="text-[11px] font-bold block">{s.label}</span>
                  <span className="text-[8px] text-slate-500 font-sans block mt-0.5">Area multiplier: {s.mult}x</span>
                </button>
              ))}
            </div>
          </div>

          {/* Qty + Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quantity (units)</label>
              <input
                type="number"
                min={50}
                step={50}
                value={qty}
                onChange={e => setQty(parseInt(e.target.value) || 50)}
                className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Print Colors</label>
              <select
                value={colors}
                onChange={e => setColors(parseInt(e.target.value))}
                className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue"
              >
                <option value={1}>1 Color</option>
                <option value={2}>2 Colors</option>
                <option value={3}>3 Colors</option>
                <option value={4}>4 Color CMYK</option>
              </select>
            </div>
          </div>

          {/* Finishing Options */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Finishing Options</label>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {finishings.map(f => {
                const isSelected = selectedFinishing.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleFinishing(f.id)}
                    className={`px-2.5 py-1.5 rounded-lg border text-left text-[10px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan'
                        : 'bg-slate-950/20 border-slate-850 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="block font-mono text-slate-500">+{fmt(f.cost, currency)}/unit</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Results Card */}
      <div className="glass-panel rounded-2xl p-5 border border-brand-blue/20 bg-slate-950/30 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[13px] font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" />
            <span>Live Quote Calculation</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">{selectedMaterial.label} · {selectedSize.label} · Qty {qty}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Material Cost',    val: fmt(materialTotalCost, currency),   sub: 'Total sheets' },
            { label: 'Setup + Print Run',val: fmt(colorSetupCost + printRunCost, currency), sub: `${colors} color plates` },
            { label: 'Finishing Cost',   val: fmt(finishingCostPerUnit * qty, currency), sub: `${selectedFinishing.length} finishing(s)` },
            { label: 'Base Cost/Unit',   val: fmt(baseCostPerUnit, currency),      sub: 'Before markup' },
          ].map((item, i) => (
            <div key={i} className="bg-slate-950/40 rounded-xl p-3 border border-slate-850">
              <p className="text-[10px] text-slate-500 font-medium">{item.label}</p>
              <p className="text-sm font-bold text-white font-mono mt-1">{item.val}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-850 pt-4">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Retail Unit Price ({markup}% markup)</p>
            <p className="text-2xl font-bold text-white font-mono">{fmt(retailUnit, currency)}</p>
            <p className="text-[11px] text-brand-cyan mt-0.5">Grand Total ({qty} units): <span className="font-bold">{fmt(grandTotal, currency)}</span></p>
          </div>
          <button
            onClick={() => {
              onSendToDocBuilder({ title: `${selectedMaterial.label} ${colors}-Color Print (${selectedSize.label})`, unit: 'Units', rate: Math.round(retailUnit), qty });
              confetti({ particleCount: 40, spread: 30 });
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-pink text-white text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-brand-blue/10 transition-all hover:-translate-y-0.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to Doc Builder</span>
          </button>
        </div>

        {/* AI Optimizer */}
        <div className="border-t border-slate-850 pt-3 space-y-2">
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-brand-pink/30 hover:border-brand-pink text-brand-pink text-[11px] font-semibold transition-all"
          >
            {isOptimizing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            <span>{isOptimizing ? 'Analyzing market data...' : 'Gemini AI Pricing Insight'}</span>
          </button>
          {aiReport && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 leading-relaxed">
              {aiReport}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function PricingMatrix({ onSendToDocBuilder, setActiveTab, isDark = true }) {
  const [activeService, setActiveService]   = useState('board');
  const [markup, setMarkup]                 = useState(35);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [notification, setNotification]     = useState('');

  // Live pricing states initialized with mock fallbacks
  const [materials, setMaterials] = useState(MATERIALS);
  const [sheetSizes, setSheetSizes] = useState(SHEET_SIZES);
  const [finishings, setFinishings] = useState(FINISHINGS);
  const [designServices, setDesignServices] = useState(DESIGN_SERVICES);
  const [screenServices, setScreenServices] = useState(SCREEN_SERVICES);
  const [laserServices, setLaserServices] = useState(LASER_SERVICES);
  const [n8nServices, setN8nServices] = useState(N8N_SERVICES);

  useEffect(() => {
    async function fetchPricingData() {
      const [matRes, sizeRes, svcRes] = await Promise.all([
        supabase.from('pricing_materials').select('*').eq('is_active', true),
        supabase.from('pricing_sheet_sizes').select('*').eq('is_active', true),
        supabase.from('pricing_services').select('*').eq('is_active', true)
      ]);

      if (matRes.data && matRes.data.length > 0) {
        setMaterials(matRes.data.map(m => ({
          id: m.id,
          label: m.name,
          costPerSheet: Number(m.cost_per_sheet),
          gsm: m.gsm,
          note: m.note
        })));
      }

      if (sizeRes.data && sizeRes.data.length > 0) {
        setSheetSizes(sizeRes.data.map(s => ({
          id: s.id,
          label: s.label,
          area: Number(s.area_sqin),
          mult: Number(s.multiplier),
          note: s.note
        })));
      }

      if (svcRes.data && svcRes.data.length > 0) {
        const boardSvcs = svcRes.data.filter(s => s.category === 'board');
        if (boardSvcs.length > 0) {
          setFinishings(boardSvcs.map(s => ({
            id: s.id,
            label: s.label,
            cost: Number(s.base_rate)
          })));
        }

        const designSvcs = svcRes.data.filter(s => s.category === 'design');
        if (designSvcs.length > 0) {
          setDesignServices(designSvcs.map(s => ({
            label: s.label,
            unit: s.unit,
            rate: Number(s.base_rate)
          })));
        }

        const screenSvcs = svcRes.data.filter(s => s.category === 'screen');
        if (screenSvcs.length > 0) {
          setScreenServices(screenSvcs.map(s => ({
            label: s.label,
            unit: s.unit,
            rate: Number(s.base_rate)
          })));
        }

        const laserSvcs = svcRes.data.filter(s => s.category === 'laser');
        if (laserSvcs.length > 0) {
          setLaserServices(laserSvcs.map(s => ({
            label: s.label,
            unit: s.unit,
            rate: Number(s.base_rate)
          })));
        }

        const devSvcs = svcRes.data.filter(s => s.category === 'dev');
        if (devSvcs.length > 0) {
          setN8nServices(devSvcs.map(s => ({
            label: s.label,
            unit: s.unit,
            rate: Number(s.base_rate)
          })));
        }
      }
    }
    fetchPricingData();
  }, []);

  const handleSendToDocBuilder = useCallback((item) => {
    if (onSendToDocBuilder) onSendToDocBuilder(item);
    setNotification(`✅ "${item.title}" sent to Doc Builder!`);
    setTimeout(() => setNotification(''), 3500);
    if (setActiveTab) setTimeout(() => setActiveTab('editor'), 500);
  }, [onSendToDocBuilder, setActiveTab]);

  const currentServices = {
    design: designServices,
    screen: screenServices,
    laser:  laserServices,
    dev:    n8nServices,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            PixelWave Pricing Calculator
            <Sparkles className="w-5 h-5 text-brand-pink animate-pulse" />
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Select a service → configure materials & quantity → get live pricing → send to Doc Builder.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency Switcher */}
          <div className="flex bg-slate-950/50 p-1 border border-slate-850 rounded-xl no-print">
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => setSelectedCurrency(c)}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all
                  ${selectedCurrency.code === c.code
                  ? isDark ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white text-slate-900 border border-slate-300 shadow-sm'
                  : isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-900' : 'text-slate-600 hover:text-brand-blue hover:bg-slate-200/50'
                }`}
              >
                {c.code}
              </button>
            ))}
          </div>

          {/* Markup Slider */}
          <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-1.5 no-print">
            <span className="text-[11px] text-slate-400 font-semibold">Markup:</span>
            <input
              type="range"
              min={10}
              max={100}
              value={markup}
              onChange={e => setMarkup(parseInt(e.target.value))}
              className="w-20 accent-brand-blue"
            />
            <span className="text-[13px] font-bold text-brand-cyan font-mono w-8">{markup}%</span>
          </div>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-950/20 border border-emerald-900/30 px-4 py-3 rounded-xl text-[13px] text-emerald-400 font-semibold">
          {notification}
        </div>
      )}

      {/* Service Tab Bar */}
      <div className="flex gap-2 flex-wrap no-print">
        {SERVICE_TABS.map(tab => {
          const Icon = tab.Icon;
          const isActive = activeService === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveService(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-bold transition-all duration-300 ${
                  isActive
                  ? `bg-gradient-to-r from-brand-blue/20 to-brand-pink/10 border-brand-blue shadow-sm ${isDark ? 'text-white' : 'text-brand-blue border'}`
                  : `border-transparent hover:border-slate-800 ${isDark ? 'bg-slate-950/20 text-slate-400 hover:bg-slate-900' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200'}`
                }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-cyan' : ''}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel Content */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
        {activeService === 'board' && (
          <BoardPrintingCalc
            materials={materials}
            sheetSizes={sheetSizes}
            finishings={finishings}
            markup={markup}
            currency={selectedCurrency}
            onSendToDocBuilder={handleSendToDocBuilder}
            isDark={isDark}
          />
        )}
        {activeService !== 'board' && (
          <ServiceRateTable
            services={currentServices[activeService]}
            markup={markup}
            currency={selectedCurrency}
            onSendToDocBuilder={handleSendToDocBuilder}
          />
        )}
      </div>
    </div>
  );
}
