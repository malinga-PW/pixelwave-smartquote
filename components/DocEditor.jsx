import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, Trash2, Save, FileSpreadsheet, 
  RefreshCcw, ArrowRight, Printer, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import { mockAIIntakePresets } from '../data/mockDatabase';

export default function DocEditor({ 
  viewDocument, 
  onSaveDocument, 
  onConvertDocument,
  documents,
  isDark = true
}) {
  const [selectedPresetId, setSelectedPresetId] = useState(mockAIIntakePresets[0].id);
  const [rawText, setRawText] = useState(mockAIIntakePresets[0].rawMessage);
  const [isParsing, setIsParsing] = useState(false);
  const [activeStepLog, setActiveStepLog] = useState('');

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [docType, setDocType] = useState('Quote');
  const [docStatus, setDocStatus] = useState('Draft');
  const [quoteNo, setQuoteNo] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [items, setItems] = useState([
    { id: '1', item_title: '', description: '', qty: 1, unit_price: 0 }
  ]);

  // Load existing document if viewing one
  useEffect(() => {
    if (viewDocument) {
      setCustomerName(viewDocument.customer_name);
      setCustomerEmail(viewDocument.customer_email || '');
      setCustomerPhone(viewDocument.customer_phone || '');
      setCustomerAddress(viewDocument.customer_address || '');
      setIssueDate(viewDocument.issue_date);
      setDocType(viewDocument.type);
      setDocStatus(viewDocument.status);
      setQuoteNo(viewDocument.quote_no);
      setNotes(viewDocument.notes || '');
      setTerms(viewDocument.terms || '');
      setDiscountPercent(viewDocument.discount_percentage || 0);
      setTaxPercent(viewDocument.tax_percentage || 0);
      setItems(viewDocument.items || []);
    } else {
      // Clear form for new document
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerAddress('');
      setIssueDate(new Date().toISOString().split('T')[0]);
      setDocType('Quote');
      setDocStatus('Draft');
      setQuoteNo(`PW-2026-${String(documents.length + 1).padStart(4, '0')}`);
      setNotes('');
      setTerms('1. 50% advance payment required upon Proforma Invoice confirmation.\n2. Delivery within 10 working days from design approval.');
      setDiscountPercent(0);
      setTaxPercent(0);
      setItems([{ id: '1', item_title: '', description: '', qty: 1, unit_price: 0 }]);
    }
  }, [viewDocument, documents]);

  // Update preset raw message when selection changes
  const handlePresetChange = (presetId) => {
    setSelectedPresetId(presetId);
    const preset = mockAIIntakePresets.find(p => p.id === presetId);
    if (preset) {
      setRawText(preset.rawMessage);
    }
  };

  // Simulate n8n AI Agent parsing
  const simulateAIParse = async () => {
    setIsParsing(true);
    const preset = mockAIIntakePresets.find(p => p.id === selectedPresetId) || mockAIIntakePresets[0];
    
    const logs = [
      '📡 Webhook triggered with raw text brief...',
      '🤖 [AI Agent] Invoking Gemini-3.5 model for parsing...',
      '📊 [AI Agent] Extracting details and searching database...',
      '📈 [AI Agent] Cost matrices applied. Syncing document...'
    ];

    for (let i = 0; i < logs.length; i++) {
      setActiveStepLog(logs[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    const data = preset.parsedOutput;
    setCustomerName(data.customer_name);
    setCustomerEmail(data.customer_email);
    setCustomerPhone(data.customer_phone);
    setCustomerAddress(data.customer_address);
    setNotes(data.notes);
    setTerms(data.terms);
    setItems(data.items.map((it, idx) => ({ ...it, id: String(idx + 1) })));
    
    setIsParsing(false);
    setActiveStepLog('');
  };

  // Form helpers
  const handleAddItemRow = () => {
    setItems([
      ...items,
      { id: String(Date.now()), item_title: '', description: '', qty: 1, unit_price: 0 }
    ]);
  };

  const handleRemoveItemRow = (id) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'unit_price') {
          updated.qty = parseInt(updated.qty) || 0;
          updated.unit_price = parseFloat(updated.unit_price) || 0;
        }
        return updated;
      }
      return item;
    }));
  };

  // Financial Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.unit_price), 0);
  const discountVal = subtotal * (discountPercent / 100);
  const taxVal = (subtotal - discountVal) * (taxPercent / 100);
  const grandTotal = subtotal - discountVal + taxVal;

  const handleSave = () => {
    if (!customerName.trim()) {
      alert('Please enter a Customer Name');
      return;
    }

    const savedDoc = {
      id: quoteNo,
      quote_no: quoteNo,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      issue_date: issueDate,
      type: docType,
      status: docStatus,
      subtotal,
      discount_percentage: parseFloat(discountPercent) || 0,
      tax_percentage: parseFloat(taxPercent) || 0,
      grand_total: grandTotal,
      notes,
      terms,
      items: items.map(it => ({
        ...it,
        line_total: it.qty * it.unit_price
      }))
    };

    onSaveDocument(savedDoc);
  };

  // Status lists dependent on document type
  const getStatusesForType = (type) => {
    switch (type) {
      case 'Quote': return ['Draft', 'Sent', 'Approved', 'Revised'];
      case 'Proforma': return ['Unpaid', 'Paid'];
      case 'Agreement': return ['Draft', 'Signed'];
      case 'Order': return ['Pending', 'In Production', 'Completed'];
      case 'Invoice': return ['Draft', 'Sent', 'Paid'];
      default: return ['Draft'];
    }
  };

  // Triggers conversion of document type (e.g. Approved Quote -> Proforma)
  const handleConvert = (newType) => {
    onConvertDocument(quoteNo, newType);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-screen">
      {/* LEFT PANEL: AI Intake Intake (Saves time) */}
      <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between space-y-4 h-[calc(100vh-6rem)] sticky top-24 no-print">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-pink" />
              <span>n8n AI Intake Intake</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-brand-pink/10 border border-brand-pink/20 text-brand-pink font-semibold">
              Gemini 3.5 Ready
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Paste a client's WhatsApp inquiry or email details below. The AI Agent node extracts specifications, quantities, and populates the editor instantly.
          </p>

          {/* Preset Selection Pills */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">💡 Ingest Test Presets</label>
            <div className="flex flex-wrap gap-2">
              {mockAIIntakePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetChange(preset.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${
                    selectedPresetId === preset.id 
                      ? `bg-gradient-to-r from-brand-blue/20 to-brand-pink/15 border-brand-pink ${isDark ? 'text-white' : 'text-brand-pink shadow-sm'}`
                      : `border-transparent hover:border-slate-800 ${isDark ? 'bg-slate-950/20 text-slate-400 hover:bg-slate-900' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200'}`
                    }`}
                >
                  {preset.title.replace(' (WhatsApp)', '').replace(' (Email)', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Raw Text Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Raw Message Ingestion</label>
            <textarea
              rows="8"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw email or message details here..."
              className="w-full bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-blue font-mono leading-relaxed resize-none"
            ></textarea>
          </div>
        </div>

        {/* Action Button & Loader */}
        <div className="space-y-3">
          {isParsing && (
            <div className="bg-slate-950/50 border border-slate-850 p-3 rounded-xl flex items-center gap-3">
              <RefreshCcw className="w-4 h-4 text-brand-cyan animate-spin" />
              <span className="text-[11px] font-mono text-slate-400">{activeStepLog}</span>
            </div>
          )}
          
          <button
            onClick={simulateAIParse}
            disabled={isParsing}
            className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              isParsing 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                : 'bg-gradient-to-r from-brand-blue to-brand-pink hover:from-brand-blue/95 hover:to-brand-pink/95 text-white shadow-lg shadow-brand-pink/10 transform hover:-translate-y-0.5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isParsing ? 'n8n parsing in progress...' : 'Execute n8n AI Parse'}</span>
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: Interactive Document Form Editor */}
      <div className="lg:col-span-7 space-y-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-6">
          {/* Form Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <span>{viewDocument ? 'Edit Document' : 'Create Document'}</span>
                <span className="text-brand-cyan font-mono text-sm">[{quoteNo}]</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Generate and transition documents across the workflow lifecycle.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save state</span>
              </button>
            </div>
          </div>

          {/* Quick Actions (Conversions) */}
          {viewDocument && viewDocument.type === 'Quote' && viewDocument.status === 'Approved' && (
            <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-emerald-400">Approved Quotation Actions</p>
                  <p className="text-[10px] text-slate-400">This quote is approved. Settle pre-payment or generate service agreements.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleConvert('Proforma')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#090d16] text-[10px] font-bold transition-all flex items-center gap-1"
                >
                  <span>Proforma (PI)</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleConvert('Agreement')}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-bold transition-all flex items-center gap-1"
                >
                  <span>Agreement</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Core Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-brand-cyan tracking-wider uppercase">Client & Metadata</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</label>
                <textarea
                  rows="2"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                ></textarea>
              </div>
            </div>

            {/* Document Lifecycle state */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-brand-pink tracking-wider uppercase">Document Lifecycle Phase</h4>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setDocType(newType);
                      // Auto select first status for type
                      setDocStatus(getStatusesForType(newType)[0]);
                    }}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-semibold text-brand-cyan"
                  >
                    <option value="Quote">Quotation</option>
                    <option value="Proforma">Proforma (PI)</option>
                    <option value="Agreement">Agreement</option>
                    <option value="Order">Work Order</option>
                    <option value="Invoice">Final Invoice</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={docStatus}
                    onChange={(e) => setDocStatus(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                  >
                    {getStatusesForType(docType).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Internal Notes & Briefs</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g., Client requested vinyl finish options..."
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terms & Conditions</label>
                <textarea
                  rows="2"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono leading-relaxed"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Dynamic Line Items Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-white tracking-wider uppercase">Line Items & Costings</h4>
              <button
                onClick={handleAddItemRow}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-brand-cyan text-[10px] font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Service / Title</th>
                    <th className="py-2.5 px-3">Detailed Description</th>
                    <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-28 text-right">Unit LKR</th>
                    <th className="py-2.5 px-3 w-28 text-right">Total LKR</th>
                    <th className="py-2.5 px-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/10">
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.item_title}
                          onChange={(e) => handleItemChange(item.id, 'item_title', e.target.value)}
                          placeholder="E.g., Pouch Design"
                          className="w-full bg-slate-950/30 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <textarea
                          rows="1"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="Details..."
                          className="w-full bg-slate-950/30 border border-slate-850 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-brand-blue resize-none"
                        ></textarea>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                          className="w-full bg-slate-950/30 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-100 text-center focus:outline-none focus:border-brand-blue font-mono"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(item.id, 'unit_price', e.target.value)}
                          className="w-full bg-slate-950/30 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-100 text-right focus:outline-none focus:border-brand-blue font-mono"
                        />
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-semibold text-slate-200">
                        {(item.qty * item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => handleRemoveItemRow(item.id)}
                          disabled={items.length === 1}
                          className={`p-1.5 rounded-lg border border-slate-850 transition-colors ${
                            items.length === 1 
                              ? `${isDark ? 'text-slate-700 border-slate-900' : 'text-slate-400 border-slate-300'} cursor-not-allowed` 
                              : `hover:border-brand-blue ${isDark ? 'text-slate-300 hover:text-white bg-slate-950 border-slate-800' : 'text-slate-700 hover:text-brand-blue bg-white border-slate-200'}`
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Financial Calculator Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Discount and Taxes controls */}
            <div className="flex gap-3 bg-slate-950/20 border border-slate-850 p-4 rounded-xl">
              <div className="space-y-1 flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount (%)</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950/40 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
                />
              </div>

              <div className="space-y-1 flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taxes / VAT (%)</label>
                <input
                  type="number"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950/40 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
                />
              </div>
            </div>

            {/* Subtotal, discount & grand total details */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-2 relative overflow-hidden">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono">{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} LKR</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between items-center text-xs text-red-400">
                  <span>Discount ({discountPercent}%):</span>
                  <span className="font-mono">-{discountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} LKR</span>
                </div>
              )}
              {taxPercent > 0 && (
                <div className="flex justify-between items-center text-xs text-brand-cyan">
                  <span>Taxes ({taxPercent}%):</span>
                  <span className="font-mono">+{taxVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} LKR</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-slate-800/60 pt-2 text-sm font-bold text-white relative z-10">
                <span className="text-gradient-blue-pink">Grand Total:</span>
                <span className="text-brand-cyan font-mono text-base">{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} LKR</span>
              </div>
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-tr from-brand-blue/5 to-transparent rounded-full blur-md"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
