import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Plus, Trash2, Save, FileSpreadsheet, 
  RefreshCcw, ArrowRight, Printer, AlertTriangle, CheckCircle2, 
  Download, Globe, Image
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { mockAIIntakePresets } from '../data/mockDatabase';

export default function DocEditor({ 
  viewDocument, 
  onSaveDocument, 
  onConvertDocument,
  documents,
  isDark = true,
  setActiveTab
}) {
  const [selectedPresetId, setSelectedPresetId] = useState(mockAIIntakePresets[0].id);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Hi! Send me a client inquiry and I\'ll extract the details to populate the document. Pick a test preset below or type your own message.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [activeStepLog, setActiveStepLog] = useState('');
  const chatEndRef = useRef(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollTo({ top: chatEndRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, isParsing]);

  // Close download menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target)) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleDownloadPDF = () => {
    setShowDownloadMenu(false);
    window.print();
  };

  const handleDownloadJPEG = async () => {
    setShowDownloadMenu(false);
    try {
      const el = document.querySelector('.glass-panel');
      if (!el) return;
      const canvas = await html2canvas(el, { backgroundColor: '#090d16', scale: 2 });
      const link = document.createElement('a');
      link.download = (quoteNo || 'document') + '.jpeg';
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (err) {
      console.error('JPEG download failed:', err);
    }
  };

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

  // Chat handlers
  const addMessage = (role, text) => {
    setChatMessages(prev => [...prev, { role, text }]);
  };

  const handlePresetChange = (presetId) => {
    setSelectedPresetId(presetId);
    const preset = mockAIIntakePresets.find(p => p.id === presetId);
    if (preset) {
      setChatInput(preset.rawMessage);
    }
  };

  const handleSendMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || isParsing) return;
    addMessage('user', msg);
    setChatInput('');
    await simulateAIParse(msg);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Simulate n8n AI Agent parsing
  const simulateAIParse = async (rawText) => {
    setIsParsing(true);
    setActiveStepLog('');

    const logs = [
      '📡 Webhook triggered with raw text brief...',
      '🤖 [AI Agent] Invoking Gemini-3.5 model for parsing...',
      '📊 [AI Agent] Extracting details and searching database...',
      '📈 [AI Agent] Cost matrices applied. Syncing document...'
    ];

    for (let i = 0; i < logs.length; i++) {
      setActiveStepLog(logs[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const preset = mockAIIntakePresets.find(p => p.id === selectedPresetId) || mockAIIntakePresets[0];
    const data = preset.parsedOutput;

    // Build AI response summary
    const itemSummary = data.items.map(it => `• ${it.item_title} — ${it.qty} x ${it.unit_price.toLocaleString()} LKR`).join('\n');
    const aiResponse = `✅ **Parsed Successfully!**\n\n**Customer:** ${data.customer_name}\n**Email:** ${data.customer_email}\n**Phone:** ${data.customer_phone}\n**Total:** ${data.items.reduce((s, it) => s + it.qty * it.unit_price, 0).toLocaleString()} LKR\n\n**Items:**\n${itemSummary}\n\nForm fields have been populated. Review and save.`;

    addMessage('ai', aiResponse);

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-7rem)]">
      {/* LEFT PANEL: AI Intake Intake */}
      <div className="lg:col-span-4 glass-panel rounded-2xl p-4 border border-slate-800/80 flex flex-col h-[calc(100vh-7rem)] sticky top-24 no-print">
        {/* Header */}
        <div className="flex justify-between items-center flex-shrink-0">
          <h3 className="text-[13px] font-bold text-white tracking-wider uppercase flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
            <span>n8n AI Intake</span>
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-brand-pink/10 border border-brand-pink/20 text-brand-pink font-semibold">
            Gemini 3.5
          </span>
        </div>

        {/* Preset Selection Pills */}
        <div className="flex items-center gap-2 mt-3 flex-shrink-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Test Presets</span>
          <div className="flex flex-wrap gap-1.5">
            {mockAIIntakePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset.id)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
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

        {/* Chat Messages - fills remaining space */}
        <div ref={chatEndRef} className="flex-1 overflow-y-auto mt-3 bg-slate-950/30 border border-slate-800/60 rounded-xl p-2.5 space-y-2.5">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-brand-blue to-brand-pink text-white rounded-br-md'
                  : 'bg-slate-800/70 text-slate-200 rounded-bl-md'
              }`}>
                {msg.text.split('\n').map((line, j) => (
                  <span key={j}>{line}<br /></span>
                ))}
              </div>
            </div>
          ))}
          {isParsing && (
            <div className="flex justify-start">
              <div className="bg-slate-800/70 text-slate-300 rounded-2xl rounded-bl-md px-3 py-2 text-[12px] flex items-center gap-2">
                <RefreshCcw className="w-3 h-3 text-brand-cyan animate-spin" />
                <span className="font-mono">{activeStepLog || 'Thinking...'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input - fixed at bottom */}
        <div className="flex items-end gap-1.5 mt-3 flex-shrink-0">
          <textarea
            rows="5"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a client inquiry... (Shift+Enter for new line)"
            disabled={isParsing}
            className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-[12px] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-blue resize-none leading-relaxed"
          />
          <div className="flex flex-col gap-1.5 self-end">
            <button
              onClick={() => document.getElementById('chat-file-input')?.click()}
              disabled={isParsing}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Attach screenshot, voice note or file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <button
              onClick={() => document.getElementById('chat-camera-input')?.click()}
              disabled={isParsing}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Capture photo from camera"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <button
              onClick={handleSendMessage}
              disabled={isParsing || !chatInput.trim()}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-pink text-white text-[11px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:from-brand-blue/95 hover:to-brand-pink/95 flex items-center gap-1"
            >
              Send
            </button>
          </div>
        </div>
        <input id="chat-file-input" type="file" accept="image/*,audio/*,.pdf,.doc,.docx" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            addMessage('user', `📎 Attached: ${file.name}`);
            setChatInput('');
            e.target.value = '';
          }
        }} />
        <input id="chat-camera-input" type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            addMessage('user', `📷 Photo captured: ${file.name}`);
            setChatInput('');
            e.target.value = '';
          }
        }} />
      </div>

      {/* RIGHT PANEL: Interactive Document Form Editor */}
      <div className="lg:col-span-8 h-full overflow-y-auto">
        <div className="glass-panel rounded-2xl p-4 border border-slate-800/80 space-y-3">
          {/* Form Header */}
          <div className="flex justify-between items-center gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-[13px] font-bold text-white flex items-center gap-2">
                <span>{viewDocument ? 'Edit Document' : 'Create Document'}</span>
                <span className="text-brand-cyan font-mono text-[12px]">[{quoteNo}]</span>
              </h3>
            </div>
            
            <div className="flex gap-1.5" ref={downloadRef}>
              {/* Download Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-all"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
                {showDownloadMenu && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-36 bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-xl">
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] text-slate-200 hover:bg-slate-800 font-semibold transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>PDF (Print)</span>
                    </button>
                    <button
                      onClick={handleDownloadJPEG}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] text-slate-200 hover:bg-slate-800 font-semibold transition-all"
                    >
                      <Image className="w-3.5 h-3.5" />
                      <span>JPEG Image</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Send to Portal */}
              <button
                onClick={() => {
                  handleSave();
                  setTimeout(() => setActiveTab('portal'), 300);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-blue to-brand-pink hover:from-brand-blue/95 hover:to-brand-pink/95 text-white text-[11px] font-semibold flex items-center gap-1 shadow-lg shadow-brand-blue/10 transition-all"
              >
                <Globe className="w-3 h-3" />
                <span>Portal</span>
              </button>

              <button
                onClick={handleSave}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-[11px] font-semibold flex items-center gap-1 shadow-lg shadow-emerald-500/10 transition-all"
              >
                <Save className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Quick Actions (Conversions) */}
          {viewDocument && viewDocument.type === 'Quote' && viewDocument.status === 'Approved' && (
            <div className="bg-emerald-950/20 border border-emerald-900/50 p-3 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <p className="text-[11px] font-bold text-emerald-400">Approved — Convert to:</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => handleConvert('Proforma')} className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#090d16] text-[10px] font-bold transition-all flex items-center gap-1">
                  <span>Proforma</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
                <button onClick={() => handleConvert('Agreement')} className="px-2 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-bold transition-all flex items-center gap-1">
                  <span>Agreement</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          )}

          {/* Core Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col h-full">
              <h4 className="text-[11px] font-bold text-brand-cyan tracking-wider uppercase">Client Details</h4>
              <div className="space-y-1 mt-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer Name</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2.5 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                  <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2.5 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Issue Date</label>
                  <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2.5 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue font-mono" style={{ colorScheme: 'dark' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Document Type</label>
                  <select value={docType} onChange={(e) => { setDocType(e.target.value); setDocStatus(getStatusesForType(e.target.value)[0]); }} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2.5 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue font-semibold text-brand-cyan">
                    <option value="Quote">Quotation</option>
                    <option value="Proforma">Proforma (PI)</option>
                    <option value="Agreement">Agreement</option>
                    <option value="Order">Work Order</option>
                    <option value="Invoice">Final Invoice</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                  <select value={docStatus} onChange={(e) => setDocStatus(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2.5 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue">
                    {getStatusesForType(docType).map((st) => (<option key={st} value={st}>{st}</option>))}
                  </select>
                </div>
              </div>
              <div className="space-y-1 mt-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2.5 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue" />
              </div>
              <div className="flex-1 flex flex-col justify-end mt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Address</label>
                  <textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2.5 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue flex-1" rows="5"></textarea>
                </div>
              </div>
            </div>

            <div className="flex flex-col h-full">
              <h4 className="text-[11px] font-bold text-brand-pink tracking-wider uppercase">Notes & Terms</h4>
              <div className="flex-1 flex flex-col justify-end gap-2 mt-2">
                <div className="space-y-1 flex-1 flex flex-col">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="E.g., Client requested vinyl finish..." className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2.5 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue flex-1" rows="5"></textarea>
                </div>
                <div className="space-y-1 flex-1 flex flex-col">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Terms</label>
                  <textarea value={terms} onChange={(e) => setTerms(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2.5 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue font-mono leading-relaxed flex-1" rows="5"></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Line Items Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-bold text-white tracking-wider uppercase">Line Items</h4>
              <button
                onClick={handleAddItemRow}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-brand-cyan text-[10px] font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/20 max-h-[180px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-900/95">
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-2 px-2.5">Service</th>
                    <th className="py-2 px-2.5">Description</th>
                    <th className="py-2 px-2.5 w-16 text-center">Qty</th>
                    <th className="py-2 px-2.5 w-28 text-right">Unit LKR</th>
                    <th className="py-2 px-2.5 w-28 text-right">Total LKR</th>
                    <th className="py-2 px-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-[13px]">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/10">
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={item.item_title}
                          onChange={(e) => handleItemChange(item.id, 'item_title', e.target.value)}
                          placeholder="Service"
                          className="w-full bg-slate-950/30 border border-slate-850 rounded-lg px-2 py-1.5 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <textarea
                          rows="1"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="Details"
                          className="w-full bg-slate-950/30 border border-slate-850 rounded-lg px-2 py-1.5 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue resize-none"
                        ></textarea>
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                          className="w-full bg-slate-950/30 border border-slate-850 rounded-lg px-2 py-1.5 text-[13px] text-slate-100 text-center focus:outline-none focus:border-brand-blue font-mono"
                        />
                      </td>
                      <td className="py-1.5 px-2 text-right">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(item.id, 'unit_price', e.target.value)}
                          className="w-full bg-slate-950/30 border border-slate-850 rounded-lg px-2 py-1.5 text-[13px] text-slate-100 text-right focus:outline-none focus:border-brand-blue font-mono"
                        />
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono font-semibold text-slate-200 text-[13px]">
                        {(item.qty * item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <button
                          onClick={() => handleRemoveItemRow(item.id)}
                          disabled={items.length === 1}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            items.length === 1 
                              ? 'text-slate-700 border-slate-900 cursor-not-allowed' 
                              : 'hover:border-brand-blue text-slate-300 hover:text-white bg-slate-950 border-slate-800'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
            <div className="flex gap-2 bg-slate-950/20 border border-slate-850 p-3 rounded-xl">
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Discount %</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2.5 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
                />
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">VAT %</label>
                <input
                  type="number"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2.5 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
                />
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 space-y-1 relative overflow-hidden">
              <div className="flex justify-between items-center text-[12px] text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono">{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} LKR</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between items-center text-[12px] text-red-400">
                  <span>Disc. ({discountPercent}%):</span>
                  <span className="font-mono">-{discountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} LKR</span>
                </div>
              )}
              {taxPercent > 0 && (
                <div className="flex justify-between items-center text-[12px] text-brand-cyan">
                  <span>VAT ({taxPercent}%):</span>
                  <span className="font-mono">+{taxVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} LKR</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-slate-800/60 pt-1.5 text-[13px] font-bold text-white relative z-10">
                <span className="text-gradient-blue-pink">Grand Total:</span>
                <span className="text-brand-cyan font-mono">{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} LKR</span>
              </div>
              <div className="absolute right-0 top-0 w-20 h-20 bg-gradient-to-tr from-brand-blue/5 to-transparent rounded-full blur-md"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
