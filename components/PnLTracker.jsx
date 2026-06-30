import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  TrendingUp, TrendingDown, DollarSign, Globe, Server,
  Wifi, Megaphone, Plus, Trash2, X, BarChart2, Sparkles,
  Calendar, ChevronDown, ChevronUp, Download
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

// ─── EXPENSE CATEGORIES ────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'domain',   label: 'Domain / DNS',        icon: Globe,      color: '#009eff', bgColor: 'bg-blue-950/20',   border: 'border-blue-900/30' },
  { id: 'hosting',  label: 'Hosting (Hostinger)',  icon: Server,     color: '#a855f7', bgColor: 'bg-purple-950/20', border: 'border-purple-900/30' },
  { id: 'vps',      label: 'VPS / Cloud Server',   icon: Server,     color: '#fc0fc0', bgColor: 'bg-pink-950/20',   border: 'border-pink-900/30' },
  { id: 'internet', label: 'Internet / Data',       icon: Wifi,       color: '#0b54fe', bgColor: 'bg-indigo-950/20', border: 'border-indigo-900/30' },
  { id: 'ads',      label: 'Social Media Ads',      icon: Megaphone,  color: '#f59e0b', bgColor: 'bg-amber-950/20',  border: 'border-amber-900/30' },
  { id: 'other',    label: 'Other Expenses',        icon: DollarSign, color: '#64748b', bgColor: 'bg-slate-900/20',  border: 'border-slate-800/30' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => `Rs.${Math.abs(n).toLocaleString()}`;
const getCat = (id) => CATEGORIES.find(c => c.id === id);

// Fallback seed data if Supabase is offline
const INITIAL_EXPENSES = [
  { id: 'e1',  category: 'domain',   description: 'pixelwave.lk (2 yr)',   amount: 7200,  month: 1,  year: 2026, recurring: true,  recurrMonths: 24 },
  { id: 'e2',  category: 'domain',   description: 'maxwelllanka.lk',        amount: 3500,  month: 3,  year: 2026, recurring: true,  recurrMonths: 12 },
  { id: 'e3',  category: 'hosting',  description: 'Hostinger Business Plan',amount: 8900,  month: 1,  year: 2026, recurring: true,  recurrMonths: 12 },
  { id: 'e4',  category: 'vps',      description: 'Supabase self-hosted VPS',amount: 6500, month: 1,  year: 2026, recurring: true,  recurrMonths: 1  },
  { id: 'e5',  category: 'vps',      description: 'Supabase self-hosted VPS',amount: 6500, month: 2,  year: 2026, recurring: false, recurrMonths: 1  },
  { id: 'e6',  category: 'vps',      description: 'Supabase self-hosted VPS',amount: 6500, month: 3,  year: 2026, recurring: false, recurrMonths: 1  },
  { id: 'e7',  category: 'vps',      description: 'Supabase self-hosted VPS',amount: 6500, month: 4,  year: 2026, recurring: false, recurrMonths: 1  },
  { id: 'e8',  category: 'vps',      description: 'Supabase self-hosted VPS',amount: 6500, month: 5,  year: 2026, recurring: false, recurrMonths: 1  },
  { id: 'e9',  category: 'vps',      description: 'Supabase self-hosted VPS',amount: 6500, month: 6,  year: 2026, recurring: false, recurrMonths: 1  },
  { id: 'e10', category: 'internet', description: 'SLT Fiber 50 Mbps',      amount: 3990,  month: 1,  year: 2026, recurring: true,  recurrMonths: 1  },
  { id: 'e11', category: 'internet', description: 'SLT Fiber 50 Mbps',      amount: 3990,  month: 2,  year: 2026, recurring: false, recurrMonths: 1  },
  { id: 'e12', category: 'internet', description: 'SLT Fiber 50 Mbps',      amount: 3990,  month: 3,  year: 2026, recurring: false, recurrMonths: 1  },
  { id: 'e13', category: 'internet', description: 'SLT Fiber 50 Mbps',      amount: 3990,  month: 4,  year: 2026, recurring: false, recurrMonths: 1  },
  { id: 'e14', category: 'internet', description: 'SLT Fiber 50 Mbps',      amount: 3990,  month: 5,  year: 2026, recurring: false, recurrMonths: 1  },
  { id: 'e15', category: 'internet', description: 'SLT Fiber 50 Mbps',      amount: 3990,  month: 6,  year: 2026, recurring: false, recurrMonths: 1  },
  { id: 'e16', category: 'ads',      description: 'Facebook Ads — Packaging', amount: 5000, month: 5,  year: 2026, recurring: false, recurrMonths: 1  },
  { id: 'e17', category: 'ads',      description: 'Facebook Ads — Laser',     amount: 4000, month: 6,  year: 2026, recurring: false, recurrMonths: 1  },
  { id: 'e18', category: 'ads',      description: 'Instagram Story Boost',    amount: 2500, month: 6,  year: 2026, recurring: false, recurrMonths: 1  },
];

const INITIAL_REVENUES = [
  { month: 1, revenue: 320000 },
  { month: 2, revenue: 410000 },
  { month: 3, revenue: 280000 },
  { month: 4, revenue: 540000 },
  { month: 5, revenue: 710000 },
  { month: 6, revenue: 630000 },
];

export default function PnLTracker({ isDark = true }) {
  const currentYear  = 2026;
  const currentMonth = 6; // June
  const [selectedYear,  setSelectedYear]  = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null); // null = full year view
  const [expenses,  setExpenses]  = useState([]);
  const [revenues,  setRevenues]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showAddExpense,  setShowAddExpense]  = useState(false);
  const [showAddRevenue,  setShowAddRevenue]  = useState(false);
  const [expandedCats, setExpandedCats] = useState([]);

  // Fetch Data
  useEffect(() => {
    if (!supabase) {
      setExpenses(INITIAL_EXPENSES);
      setRevenues(INITIAL_REVENUES);
      setLoading(false);
      return;
    }

    async function fetchData() {
      const [expRes, revRes] = await Promise.all([
        supabase.from('pnl_expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('pnl_revenues').select('*')
      ]);
      
      if (expRes.data) {
        setExpenses(expRes.data.map(e => ({ ...e, recurrMonths: e.recurr_months })));
      }
      if (revRes.data) {
        setRevenues(revRes.data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Form state
  const [fCat,   setFCat]   = useState('domain');
  const [fDesc,  setFDesc]  = useState('');
  const [fAmt,   setFAmt]   = useState('');
  const [fMonth, setFMonth] = useState(currentMonth);
  const [fRev,   setFRev]   = useState('');
  const [fRevMonth, setFRevMonth] = useState(currentMonth);

  // ─── COMPUTED DATA ────────────────────────────────────────────────────────
  const filteredExpenses = useMemo(() =>
    expenses.filter(e => e.year === selectedYear && (selectedMonth === null || e.month === selectedMonth)),
    [expenses, selectedYear, selectedMonth]
  );

  const filteredRevenues = useMemo(() =>
    revenues.filter(r => selectedMonth === null || r.month === selectedMonth),
    [revenues, selectedMonth]
  );

  const totalRevenue  = filteredRevenues.reduce((s, r) => s + r.revenue, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit     = totalRevenue - totalExpenses;
  const profitMargin  = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  // Expenses grouped by category
  const catTotals = useMemo(() =>
    CATEGORIES.map(cat => ({
      ...cat,
      total: filteredExpenses.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0),
      items: filteredExpenses.filter(e => e.category === cat.id),
    })),
    [filteredExpenses]
  );

  // Month-by-month trend chart data (full year only)
  const trendData = useMemo(() =>
    MONTHS.slice(0, 6).map((m, i) => {
      const monthNum  = i + 1;
      const rev       = revenues.find(r => r.month === monthNum)?.revenue || 0;
      const exp       = expenses.filter(e => e.year === selectedYear && e.month === monthNum).reduce((s, e) => s + e.amount, 0);
      return { name: m, revenue: rev, expenses: exp, profit: rev - exp };
    }),
    [revenues, expenses, selectedYear]
  );

  // Category donut data
  const pieData = catTotals.filter(c => c.total > 0).map(c => ({
    name: c.label, value: c.total, color: c.color
  }));

  // ─── HANDLERS ─────────────────────────────────────────────────────────────
  const toggleCat = (id) =>
    setExpandedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!fDesc || !fAmt) return;
    const tempId = `e-${Date.now()}`;
    if (supabase) {
      const { data, error } = await supabase.from('pnl_expenses').insert({
        category: fCat,
        description: fDesc,
        amount: parseFloat(fAmt),
        month: parseInt(fMonth),
        year: selectedYear,
        recurring: false,
        recurr_months: 1,
      }).select();
      if (data && data.length > 0) {
        setExpenses(prev => [...prev, { ...data[0], recurrMonths: data[0].recurr_months }]);
      } else {
        console.error('Failed to add expense:', error);
      }
    } else {
      setExpenses(prev => [...prev, {
        id: tempId,
        category: fCat,
        description: fDesc,
        amount: parseFloat(fAmt),
        month: parseInt(fMonth),
        year: selectedYear,
        recurring: false,
        recurrMonths: 1,
      }]);
    }
    setShowAddExpense(false);
    setFDesc(''); setFAmt('');
  };

  const handleAddRevenue = async (e) => {
    e.preventDefault();
    if (!fRev) return;

    const monthNum = parseInt(fRevMonth);
    const amount = parseFloat(fRev);
    
    if (supabase) {
      const exists = revenues.find(r => r.month === monthNum && r.year === selectedYear);
      if (exists) {
        const { data, error } = await supabase.from('pnl_revenues')
          .update({ revenue: exists.revenue + amount })
          .eq('id', exists.id)
          .select();
        if (data && data.length > 0) {
          setRevenues(prev => prev.map(r => r.id === exists.id ? data[0] : r));
        }
      } else {
        const { data, error } = await supabase.from('pnl_revenues')
          .insert({ month: monthNum, year: selectedYear, revenue: amount })
          .select();
        if (data && data.length > 0) {
          setRevenues(prev => [...prev, data[0]]);
        }
      }
    } else {
      setRevenues(prev => {
        const exists = prev.find(r => r.month === monthNum);
        if (exists) return prev.map(r => r.month === monthNum ? { ...r, revenue: r.revenue + amount } : r);
        return [...prev, { month: monthNum, revenue: amount }];
      });
    }
    
    setShowAddRevenue(false);
    setFRev('');
  };

  const handleDeleteExpense = async (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    if (supabase) {
      await supabase.from('pnl_expenses').delete().eq('id', id);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Profit &amp; Loss Tracker
            <Sparkles className="w-5 h-5 text-brand-pink animate-pulse" />
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Track revenue, operating costs (domains, VPS, hosting, internet, ads) and monitor net profit in real time.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Month filter pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedMonth(null)}
              className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all ${selectedMonth === null ? `bg-brand-blue/20 border-brand-blue ${isDark ? 'text-white' : 'text-brand-blue shadow-sm'}` : `border-transparent hover:border-slate-800 ${isDark ? 'bg-slate-950/20 text-slate-400' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200'}`}`}
            >
              Full Year
            </button>
            {MONTHS.slice(0, currentMonth).map((m, i) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(i + 1)}
                className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all ${selectedMonth === i + 1 ? `bg-brand-pink/20 border-brand-pink ${isDark ? 'text-white' : 'text-brand-pink shadow-sm'}` : `border-transparent hover:border-slate-800 ${isDark ? 'bg-slate-950/20 text-slate-400' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200'}`}`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Add buttons */}
          <button onClick={() => setShowAddRevenue(true)} className="px-3 py-2 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5 hover:border-emerald-700 transition-all">
            <Plus className="w-3 h-3" /> Revenue
          </button>
          <button onClick={() => setShowAddExpense(true)} className="px-3 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-pink text-white text-[10px] font-bold flex items-center gap-1.5 shadow-lg shadow-brand-blue/10 hover:-translate-y-0.5 transition-all">
            <Plus className="w-3 h-3" /> Expense
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',   val: fmt(totalRevenue),  sub: selectedMonth ? MONTHS[selectedMonth-1] : 'YTD', icon: TrendingUp,   color: 'border-l-emerald-500', textColor: 'text-emerald-400' },
          { label: 'Total Expenses',  val: fmt(totalExpenses), sub: `${filteredExpenses.length} entries`,            icon: TrendingDown, color: 'border-l-red-500',     textColor: 'text-red-400' },
          { label: 'Net Profit / Loss',val: fmt(netProfit),    sub: netProfit >= 0 ? 'In profit ✓' : 'Net loss ✗',  icon: BarChart2,    color: netProfit >= 0 ? 'border-l-brand-cyan' : 'border-l-orange-500', textColor: netProfit >= 0 ? 'text-brand-cyan' : 'text-orange-400' },
          { label: 'Profit Margin',   val: `${profitMargin}%`, sub: 'Net / Revenue',                                 icon: Sparkles,    color: 'border-l-brand-pink',  textColor: 'text-brand-pink' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className={`glass-panel rounded-2xl p-5 border-l-4 ${kpi.color} relative overflow-hidden group`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                  <p className={`text-xl font-bold font-mono mt-1 ${kpi.textColor}`}>{kpi.val}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">{kpi.sub}</p>
                </div>
                <Icon className={`w-5 h-5 ${kpi.textColor} opacity-60`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Trend Area Chart (span 8) */}
        <div className="md:col-span-8 glass-panel rounded-2xl p-5 border border-slate-800/80 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Monthly Revenue vs Expenses Trend</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gPro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#009eff" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#009eff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={v => `${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(v, name) => [`Rs.${v.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Area type="monotone" dataKey="revenue"  stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gRev)" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#gExp)" />
                <Area type="monotone" dataKey="profit"   stroke="#009eff" strokeWidth={1.5} fillOpacity={1} fill="url(#gPro)" strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-5 pt-1 border-t border-slate-850">
            {[{c:'#10b981',l:'Revenue'},{c:'#ef4444',l:'Expenses'},{c:'#009eff',l:'Net Profit'}].map(x => (
              <div key={x.l} className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 inline-block rounded" style={{backgroundColor:x.c}}></span>
                <span className="text-[9px] text-slate-400 font-semibold">{x.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Donut (span 4) */}
        <div className="md:col-span-4 glass-panel rounded-2xl p-5 border border-slate-800/80 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Expense Breakdown</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catTotals.filter(c => c.total > 0)} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" stroke="#64748b" fontSize={9} tickFormatter={v => `${v/1000}k`} />
                <YAxis type="category" dataKey="label" stroke="#64748b" fontSize={9} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '10px' }}
                  formatter={v => [`Rs.${v.toLocaleString()}`]}
                />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {catTotals.filter(c => c.total > 0).map((cat, i) => (
                    <Cell key={i} fill={cat.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Category totals mini list */}
          <div className="space-y-2 border-t border-slate-850 pt-3">
            {catTotals.filter(c => c.total > 0).map(cat => {
              const Icon = cat.icon;
              const pct = totalExpenses > 0 ? ((cat.total / totalExpenses) * 100).toFixed(0) : 0;
              return (
                <div key={cat.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3" style={{ color: cat.color }} />
                    <span className="text-[9px] text-slate-400 font-semibold">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-500">{pct}%</span>
                    <span className="text-[10px] font-bold font-mono text-slate-200">{fmt(cat.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expense Log — By Category */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-850 pb-3">
          <h3 className="text-sm font-bold text-white tracking-wider uppercase">Expense Log by Category</h3>
          <span className="text-[10px] font-mono text-slate-500">{selectedMonth ? MONTHS[selectedMonth-1] : `Full Year ${selectedYear}`}</span>
        </div>

        <div className="space-y-3">
          {catTotals.map(cat => {
            const Icon = cat.icon;
            const isExpanded = expandedCats.includes(cat.id);
            if (cat.items.length === 0) return null;
            return (
              <div key={cat.id} className={`rounded-xl border ${cat.border} overflow-hidden`}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCat(cat.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 ${cat.bgColor} hover:bg-opacity-80 transition-all`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" style={{ color: cat.color }} />
                    <span className="text-xs font-bold text-white">{cat.label}</span>
                    <span className="text-[9px] text-slate-500 bg-slate-950/40 px-1.5 py-0.5 rounded font-mono">{cat.items.length} entries</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold font-mono" style={{ color: cat.color }}>{fmt(cat.total)}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </button>

                {/* Items */}
                {isExpanded && (
                  <div className="divide-y divide-slate-900/50">
                    {cat.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between px-5 py-2.5 group hover:bg-slate-900/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-xs font-semibold text-slate-200">{item.description}</p>
                            <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                              {MONTHS[item.month - 1]} {item.year}
                              {item.recurring && <span className="ml-1 text-brand-cyan">↻ Recurring</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold font-mono text-slate-200">{fmt(item.amount)}</span>
                          <button
                            onClick={() => handleDeleteExpense(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-600 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ADD EXPENSE MODAL ─────────────────────────────────────────────────── */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                Log New Expense
              </h3>
              <button onClick={() => setShowAddExpense(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expense Category</label>
                <select value={fCat} onChange={e => setFCat(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue">
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</label>
                <input required type="text" value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="E.g. Hostinger Premium Plan renewal" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Amount (LKR)</label>
                  <input required type="number" min="0" value={fAmt} onChange={e => setFAmt(e.target.value)} placeholder="0.00" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-red-300 focus:outline-none focus:border-brand-blue font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Month</label>
                  <select value={fMonth} onChange={e => setFMonth(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue">
                    {MONTHS.map((m, i) => <option key={m} value={i+1}>{m} {selectedYear}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-900/60 to-red-800/40 border border-red-800 hover:border-red-700 text-red-300 text-xs font-bold transition-all">
                Log Expense Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD REVENUE MODAL ─────────────────────────────────────────────────── */}
      {showAddRevenue && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Log Revenue Entry
              </h3>
              <button onClick={() => setShowAddRevenue(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddRevenue} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revenue Amount (LKR)</label>
                <input required type="number" min="0" value={fRev} onChange={e => setFRev(e.target.value)} placeholder="E.g. 250000" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-300 focus:outline-none focus:border-emerald-700 font-mono text-sm" />
                <p className="text-[9px] text-slate-500">This amount is added to the selected month's revenue total.</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Month</label>
                <select value={fRevMonth} onChange={e => setFRevMonth(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue">
                  {MONTHS.map((m, i) => <option key={m} value={i+1}>{m} {selectedYear}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-emerald-900/40 border border-emerald-800 hover:border-emerald-700 text-emerald-300 text-xs font-bold transition-all">
                Add Revenue Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
