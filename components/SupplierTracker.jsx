import React, { useState } from 'react';
import { Truck, Plus, TrendingUp, TrendingDown, DollarSign, Package, Trash2, Save, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const INITIAL_SUPPLIERS = [
  {
    id: 'sup-1',
    name: 'Ceylinco Paper Merchants',
    contact: '+94 11 234 5678',
    category: 'Board & Paper',
    purchases: [
      { id: 'p-1', material: 'Box Board (Grey Back)', qty: 200, unit: 'Full Sheet', unitCost: 75, clientBillRate: 85, date: '2026-06-15' },
      { id: 'p-2', material: 'Artboard 400 GSM',      qty: 100, unit: 'Full Sheet', unitCost: 140, clientBillRate: 160, date: '2026-06-20' },
    ]
  },
  {
    id: 'sup-2',
    name: 'Kalhari Printing Supplies',
    contact: '+94 77 987 1234',
    category: 'Specialty Paper',
    purchases: [
      { id: 'p-3', material: 'Ice Gold',      qty: 50,  unit: 'Full Sheet', unitCost: 250, clientBillRate: 280, date: '2026-06-10' },
      { id: 'p-4', material: 'Ice Silver',    qty: 50,  unit: 'Full Sheet', unitCost: 250, clientBillRate: 280, date: '2026-06-10' },
    ]
  },
  {
    id: 'sup-3',
    name: 'Mihiri Blanks & Fabrics',
    contact: '+94 71 345 6789',
    category: 'T-Shirts & Fabric',
    purchases: [
      { id: 'p-5', material: 'Cotton T-Shirt 200 GSM', qty: 300, unit: 'Units', unitCost: 520, clientBillRate: 600, date: '2026-06-22' },
    ]
  }
];

export default function SupplierTracker() {
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [selectedSupplierId, setSelectedSupplierId] = useState('sup-1');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [notification, setNotification] = useState('');

  // New Supplier Form
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');
  const [newSupplierCategory, setNewSupplierCategory] = useState('Board & Paper');

  // New Purchase Form
  const [newMaterial, setNewMaterial] = useState('');
  const [newQty, setNewQty] = useState(100);
  const [newUnit, setNewUnit] = useState('Full Sheet');
  const [newUnitCost, setNewUnitCost] = useState(0);
  const [newBillRate, setNewBillRate] = useState(0);

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  // Per-supplier totals
  const getSupplierStats = (supplier) => {
    const totalCost  = supplier.purchases.reduce((s, p) => s + p.unitCost * p.qty, 0);
    const totalBill  = supplier.purchases.reduce((s, p) => s + p.clientBillRate * p.qty, 0);
    const margin     = totalBill - totalCost;
    const marginPct  = totalCost > 0 ? ((margin / totalBill) * 100).toFixed(1) : 0;
    return { totalCost, totalBill, margin, marginPct };
  };

  // Global stats
  const globalStats = suppliers.reduce((acc, sup) => {
    const stats = getSupplierStats(sup);
    return {
      totalCost:   acc.totalCost + stats.totalCost,
      totalBill:   acc.totalBill + stats.totalBill,
      margin:      acc.margin + stats.margin,
    };
  }, { totalCost: 0, totalBill: 0, margin: 0 });

  const globalMarginPct = globalStats.totalBill > 0
    ? ((globalStats.margin / globalStats.totalBill) * 100).toFixed(1) : 0;

  const handleAddSupplier = (e) => {
    e.preventDefault();
    const newSup = {
      id: `sup-${Date.now()}`,
      name: newSupplierName,
      contact: newSupplierContact,
      category: newSupplierCategory,
      purchases: []
    };
    setSuppliers([...suppliers, newSup]);
    setSelectedSupplierId(newSup.id);
    setShowAddSupplier(false);
    setNewSupplierName('');
    setNewSupplierContact('');
    setNotification(`✅ Supplier "${newSup.name}" added.`);
    setTimeout(() => setNotification(''), 3500);
    confetti({ particleCount: 30, spread: 25 });
  };

  const handleAddPurchase = (e) => {
    e.preventDefault();
    const newPurchase = {
      id: `p-${Date.now()}`,
      material: newMaterial,
      qty: parseInt(newQty),
      unit: newUnit,
      unitCost: parseFloat(newUnitCost),
      clientBillRate: parseFloat(newBillRate),
      date: new Date().toISOString().split('T')[0]
    };
    setSuppliers(suppliers.map(s =>
      s.id === selectedSupplierId
        ? { ...s, purchases: [...s.purchases, newPurchase] }
        : s
    ));
    setShowAddPurchase(false);
    setNewMaterial('');
    setNotification(`✅ Purchase entry added to ${selectedSupplier?.name}.`);
    setTimeout(() => setNotification(''), 3500);
  };

  const handleDeletePurchase = (purchaseId) => {
    setSuppliers(suppliers.map(s =>
      s.id === selectedSupplierId
        ? { ...s, purchases: s.purchases.filter(p => p.id !== purchaseId) }
        : s
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Supplier / Vendor Cost Tracker
            <Truck className="w-5 h-5 text-brand-cyan" />
          </h2>
          <p className="text-slate-400 text-sm">
            Track material costs from vendors and compare against client billing rates to see true margins.
          </p>
        </div>
        <button
          onClick={() => setShowAddSupplier(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-pink text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-brand-blue/10 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      {notification && (
        <div className="bg-emerald-950/15 border border-emerald-900/30 px-4 py-3 rounded-xl text-xs text-emerald-400 font-semibold">
          {notification}
        </div>
      )}

      {/* Global Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Supplier Spend', val: `Rs.${globalStats.totalCost.toLocaleString()}`, icon: DollarSign, color: 'border-l-red-500' },
          { label: 'Total Client Billing', val: `Rs.${globalStats.totalBill.toLocaleString()}`, icon: TrendingUp, color: 'border-l-emerald-500' },
          { label: 'Gross Material Margin', val: `Rs.${globalStats.margin.toLocaleString()}`, icon: TrendingUp, color: 'border-l-brand-cyan' },
          { label: 'Overall Margin %', val: `${globalMarginPct}%`, icon: Package, color: 'border-l-brand-pink' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`glass-panel rounded-2xl p-5 border-l-4 ${stat.color}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-bold text-white font-mono mt-1">{stat.val}</p>
                </div>
                <Icon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Supplier List (4 cols) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-5 border border-slate-800/80 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-850 pb-3">
            Suppliers ({suppliers.length})
          </h3>
          <div className="space-y-2">
            {suppliers.map(sup => {
              const stats = getSupplierStats(sup);
              const isSelected = sup.id === selectedSupplierId;
              return (
                <button
                  key={sup.id}
                  onClick={() => setSelectedSupplierId(sup.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-brand-blue/10 border-brand-blue'
                      : 'bg-slate-950/20 border-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{sup.name}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{sup.category} · {sup.purchases.length} entries</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono font-bold text-brand-cyan">+{stats.marginPct}%</p>
                      <p className="text-[9px] text-slate-500 font-mono">margin</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Purchase Log (8 cols) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-5 border border-slate-800/80 space-y-4">
          {selectedSupplier ? (
            <>
              <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedSupplier.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{selectedSupplier.contact} · {selectedSupplier.category}</p>
                </div>
                <button
                  onClick={() => setShowAddPurchase(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-brand-cyan text-[10px] font-bold flex items-center gap-1.5 hover:border-brand-cyan/50 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Purchase</span>
                </button>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2 pb-1 border-b border-slate-850">
                <div className="col-span-3">Material</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Cost/Unit</div>
                <div className="col-span-2 text-right">Bill Rate</div>
                <div className="col-span-2 text-right">Margin</div>
                <div className="col-span-1"></div>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {selectedSupplier.purchases.map(p => {
                  const lineMargin = (p.clientBillRate - p.unitCost) * p.qty;
                  const marginPct = (((p.clientBillRate - p.unitCost) / p.clientBillRate) * 100).toFixed(0);
                  return (
                    <div key={p.id} className="grid grid-cols-12 items-center bg-slate-950/30 px-3 py-2.5 rounded-xl border border-slate-850 hover:border-slate-750 group transition-colors">
                      <div className="col-span-3">
                        <p className="text-[10px] font-semibold text-slate-200">{p.material}</p>
                        <p className="text-[8px] text-slate-600 font-mono">{p.date}</p>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-xs font-mono text-slate-300">{p.qty}</span>
                        <span className="text-[8px] text-slate-600 block">{p.unit}</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-[10px] font-mono text-red-400">Rs.{p.unitCost}</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-[10px] font-mono text-emerald-400">Rs.{p.clientBillRate}</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-[10px] font-bold font-mono text-brand-cyan">+{marginPct}%</span>
                        <span className="text-[8px] text-slate-600 block font-mono">Rs.{lineMargin.toLocaleString()}</span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => handleDeletePurchase(p.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-600 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Supplier Summary Row */}
              {(() => {
                const stats = getSupplierStats(selectedSupplier);
                return (
                  <div className="border-t border-slate-850 pt-3 flex justify-between items-center">
                    <div className="flex gap-6 text-xs font-mono">
                      <span className="text-slate-500">Spend: <strong className="text-red-400">Rs.{stats.totalCost.toLocaleString()}</strong></span>
                      <span className="text-slate-500">Billed: <strong className="text-emerald-400">Rs.{stats.totalBill.toLocaleString()}</strong></span>
                      <span className="text-slate-500">Margin: <strong className="text-brand-cyan">Rs.{stats.margin.toLocaleString()} ({stats.marginPct}%)</strong></span>
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <p className="text-sm text-slate-500 text-center py-12">Select a supplier to view purchase log.</p>
          )}
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-cyan" />
                <span>Add New Supplier</span>
              </h3>
              <button onClick={() => setShowAddSupplier(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSupplier} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supplier / Vendor Name</label>
                <input required type="text" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} placeholder="E.g. ABC Paper Merchants" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Number</label>
                <input type="text" value={newSupplierContact} onChange={e => setNewSupplierContact(e.target.value)} placeholder="+94 11 234 5678" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supply Category</label>
                <select value={newSupplierCategory} onChange={e => setNewSupplierCategory(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue">
                  {['Board & Paper', 'Specialty Paper', 'T-Shirts & Fabric', 'Ink & Chemicals', 'Laser Materials', 'Packaging Supplies', 'IT / SaaS Tools'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-pink text-white text-xs font-bold">
                Add Supplier
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Purchase Modal */}
      {showAddPurchase && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-cyan" />
                <span>Log Purchase — {selectedSupplier?.name}</span>
              </h3>
              <button onClick={() => setShowAddPurchase(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddPurchase} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Material Name</label>
                <input required type="text" value={newMaterial} onChange={e => setNewMaterial(e.target.value)} placeholder="E.g. Artboard 400 GSM" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quantity</label>
                  <input type="number" min={1} value={newQty} onChange={e => setNewQty(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unit</label>
                  <select value={newUnit} onChange={e => setNewUnit(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue">
                    {['Full Sheet', 'Units', 'Kg', 'Roll', 'Ream', 'Litre'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supplier Cost / Unit (LKR)</label>
                  <input required type="number" min={0} value={newUnitCost} onChange={e => setNewUnitCost(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-red-300 focus:outline-none focus:border-brand-blue font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Client Bill Rate / Unit (LKR)</label>
                  <input required type="number" min={0} value={newBillRate} onChange={e => setNewBillRate(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-300 focus:outline-none focus:border-brand-blue font-mono" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-pink text-white text-xs font-bold">
                Log Purchase Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
