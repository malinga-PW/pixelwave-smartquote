import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle, FileDown, ShieldCheck, Sparkles, 
  Signature, CreditCard, RefreshCw, X, ArrowUpRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClientPortal({ activeDocument, onUpdateStatus }) {
  const [signatureType, setSignatureType] = useState('draw');
  const [typedName, setTypedName] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Webhook debugger states
  const [webhookLog, setWebhookLog] = useState(null);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  // Setup drawing canvas
  useEffect(() => {
    if (activeDocument && activeDocument.type === 'Agreement' && signatureType === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#0b54fe';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
    }
  }, [activeDocument, signatureType]);

  const startDrawing = (e) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(
      (e.clientX || e.touches[0].clientX) - rect.left,
      (e.clientY || e.touches[0].clientY) - rect.top
    );
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(
      (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left,
      (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top
    );
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Triggers n8n webhook notification simulator
  const fireWebhookSimulation = (eventName, docData) => {
    const payload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      n8n_version: "2.23.4",
      workflow_id: "wf-pixelwave-billing-lifecycle",
      data: {
        document_id: docData.id,
        quote_no: docData.quote_no,
        customer_name: docData.customer_name,
        customer_email: docData.customer_email,
        grand_total: docData.grand_total,
        status: docData.status
      }
    };
    setWebhookLog(payload);
    setTimeout(() => {
      setWebhookLog(null); // auto hide after 8 seconds
    }, 8000);
  };

  // Sign Action
  const handleExecuteAgreement = () => {
    if (signatureType === 'type' && !typedName.trim()) {
      alert('Please enter your name to sign');
      return;
    }
    
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setIsSigned(true);
      
      // Burst confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0b54fe', '#009eff', '#fc0fc0']
      });

      // Update doc state
      onUpdateStatus(activeDocument.id, 'Signed');
      
      // Fire n8n hook
      fireWebhookSimulation('document.signed', {
        ...activeDocument,
        status: 'Signed'
      });
    }, 1500);
  };

  // Pay Action
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvc) {
      alert('Please fill out all payment details');
      return;
    }

    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setIsPaid(true);
      setShowPayModal(false);

      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#10b981', '#009eff', '#fc0fc0']
      });

      onUpdateStatus(activeDocument.id, 'Paid');
      
      // Fire n8n hook
      fireWebhookSimulation('document.paid', {
        ...activeDocument,
        status: 'Paid'
      });
    }, 2000);
  };

  // Simple Approve Action (for Quote)
  const handleApproveQuote = () => {
    onUpdateStatus(activeDocument.id, 'Approved');
    
    confetti({
      particleCount: 120,
      spread: 70,
      colors: ['#009eff', '#0b54fe']
    });

    fireWebhookSimulation('quote.approved', {
      ...activeDocument,
      status: 'Approved'
    });
  };

  if (!activeDocument) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-slate-500 gap-3 border border-dashed border-slate-800 rounded-2xl bg-slate-950/10">
        <ShieldCheck className="w-12 h-12 opacity-30 animate-pulse text-brand-cyan" />
        <p className="text-sm font-medium">Please select a document from the Command Center list to view the Client Portal.</p>
      </div>
    );
  }

  // Calculate totals
  const discountVal = activeDocument.subtotal * (activeDocument.discount_percentage / 100);
  const taxVal = (activeDocument.subtotal - discountVal) * (activeDocument.tax_percentage / 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Portal Top Bar */}
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Secure Client Portal
          </h2>
          <p className="text-slate-400 text-sm">
            Simulated client-facing review and action space. white-labeled for PixelWave.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Link: smartquote.pixelwave.lk/secure/{activeDocument.id}
          </span>
        </div>
      </div>

      {/* Webhook Fire Alert Banner */}
      {webhookLog && (
        <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl space-y-2 relative fade-in z-50 shadow-lg shadow-emerald-500/5 no-print">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span className="text-[13px] font-bold text-emerald-400">n8n Workflow Webhook Triggered!</span>
            </div>
            <button onClick={() => setWebhookLog(null)} className="text-slate-500 hover:text-slate-300">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            A real-time webhook payload was successfully transmitted to your active n8n workflow (v2.23.4).
          </p>
          <pre className="text-[11px] bg-slate-950 border border-slate-900 rounded-lg p-3 overflow-x-auto text-brand-cyan font-mono leading-relaxed">
            {JSON.stringify(webhookLog, null, 2)}
          </pre>
        </div>
      )}

      {/* Printable Invoice Card */}
      <div className="bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-slate-200 print-card">
        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <svg viewBox="0 0 40 40" className="w-8 h-8">
                <defs>
                  <linearGradient id="portalLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0b54fe" />
                    <stop offset="100%" stopColor="#fc0fc0" />
                  </linearGradient>
                </defs>
                <path d="M10 30 C15 25, 20 20, 20 12 C20 12, 23 18, 25 22 L22 28 Z" fill="url(#portalLogoGrad)" />
              </svg>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Pixel<span className="text-[#fc0fc0]">Wave</span> Solutions
              </span>
            </div>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              Premium Packaging & Printing Solutions.<br />
              AI Powered Business Automation Web Services.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-bold text-[#0b54fe] uppercase tracking-widest">{activeDocument.type}</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{activeDocument.quote_no}</h3>
            <p className="text-[13px] text-slate-400 mt-1">Issue Date: <span className="font-mono">{activeDocument.issue_date}</span></p>
          </div>
        </div>

        {/* Client & Vendor Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-100 text-[13px]">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Issued By</span>
            <p className="font-bold text-slate-800">PixelWave Solutions</p>
            <p className="text-slate-500 mt-1 leading-relaxed">
              TechSpace Building, Suite 104,<br />
              Colombo 03, Sri Lanka.<br />
              billing@pixelwave.lk
            </p>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Prepared For</span>
            <p className="font-bold text-slate-800">{activeDocument.customer_name}</p>
            {activeDocument.customer_email && <p className="text-slate-500 mt-0.5">{activeDocument.customer_email}</p>}
            {activeDocument.customer_phone && <p className="text-slate-500 mt-0.5 font-mono">{activeDocument.customer_phone}</p>}
            {activeDocument.customer_address && (
              <p className="text-slate-500 mt-1.5 leading-relaxed">{activeDocument.customer_address}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="py-8">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="py-3 pr-4">Description of Works</th>
                <th className="py-3 px-4 w-12 text-center">Qty</th>
                <th className="py-3 px-4 w-28 text-right">Unit Price</th>
                <th className="py-3 pl-4 w-28 text-right">Amount (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {activeDocument.items.map((item, idx) => (
                <tr key={idx} className="align-top">
                  <td className="py-4 pr-4">
                    <p className="font-bold text-slate-900">{item.item_title}</p>
                    <p className="text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                  </td>
                  <td className="py-4 px-4 text-center font-mono">{item.qty}</td>
                  <td className="py-4 px-4 text-right font-mono">{item.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-4 pl-4 text-right font-mono font-bold text-slate-900">
                    {(item.qty * item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Recap & Signature Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
          {/* Terms */}
          <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Terms of Business</span>
            <pre className="font-sans whitespace-pre-wrap leading-relaxed">{activeDocument.terms}</pre>
          </div>

          {/* Pricing Totals */}
          <div className="space-y-2.5 text-[13px] text-slate-600">
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span className="font-mono">{activeDocument.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} LKR</span>
            </div>
            {activeDocument.discount_percentage > 0 && (
              <div className="flex justify-between items-center text-red-500">
                <span>Discount ({activeDocument.discount_percentage}%):</span>
                <span className="font-mono">-{discountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} LKR</span>
              </div>
            )}
            {activeDocument.tax_percentage > 0 && (
              <div className="flex justify-between items-center">
                <span>Tax ({activeDocument.tax_percentage}%):</span>
                <span className="font-mono">+{taxVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} LKR</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-sm font-bold text-slate-900">
              <span>Total Settle Sum:</span>
              <span className="font-mono text-base text-[#0b54fe]">{activeDocument.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })} LKR</span>
            </div>
          </div>
        </div>

        {/* E-Signature Display (if Signed) */}
        {activeDocument.status === 'Signed' && (
          <div className="mt-8 pt-8 border-t border-dashed border-slate-200 flex justify-end">
            <div className="text-right border border-emerald-100 bg-emerald-50/20 p-4 rounded-xl max-w-xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Contract Authenticated</span>
              <p className="text-[13px] font-semibold text-slate-700">Electronically Signed via PixelWave Portal</p>
              <div className="h-10 my-1 flex items-center justify-center font-serif text-lg italic text-[#0b54fe] tracking-wider select-none font-bold">
                ✓ Secured & Authenticated
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Hash: SHA-256/f73e4b9d0...</p>
            </div>
          </div>
        )}

        {/* Portal Action Footer (Interactive options depending on document type) */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
          <div className="text-[13px] text-slate-400">
            Status: <span className="font-bold text-slate-800">{activeDocument.status}</span>
          </div>

          <div className="flex gap-3">
            {/* Action for Quote */}
            {activeDocument.type === 'Quote' && activeDocument.status === 'Draft' && (
              <button
                onClick={handleApproveQuote}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0b54fe] to-[#009eff] hover:from-[#0b54fe]/90 hover:to-[#009eff]/90 text-white text-[13px] font-bold shadow-lg shadow-blue-500/10 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve & Accept Quote</span>
              </button>
            )}

            {/* Action for Agreement (e-sign) */}
            {activeDocument.type === 'Agreement' && activeDocument.status !== 'Signed' && !isSigned && (
              <div className="space-y-4 w-full">
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Signature className="w-4 h-4 text-[#0b54fe]" />
                      <span>E-Signature Authorization</span>
                    </span>
                    
                    <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                      <button 
                        onClick={() => setSignatureType('draw')} 
                        className={`px-2 py-1 rounded-md transition-all ${signatureType === 'draw' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                      >
                        Draw Signature
                      </button>
                      <button 
                        onClick={() => setSignatureType('type')} 
                        className={`px-2 py-1 rounded-md transition-all ${signatureType === 'type' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                      >
                        Type Name
                      </button>
                    </div>
                  </div>

                  {signatureType === 'draw' ? (
                    <div className="relative border border-slate-200 bg-white rounded-xl overflow-hidden h-28 cursor-crosshair">
                      <canvas
                        ref={canvasRef}
                        width="400"
                        height="112"
                        className="w-full h-full"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                      <button 
                        onClick={clearCanvas} 
                        className="absolute right-2 bottom-2 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 text-[8px] font-bold border border-slate-200"
                      >
                        Clear Canvas
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Type your full name to sign agreement"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-[#0b54fe]"
                    />
                  )}
                </div>

                <button
                  onClick={handleExecuteAgreement}
                  disabled={isSigning}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0b54fe] to-[#fc0fc0] hover:from-[#0b54fe]/90 hover:to-[#fc0fc0]/90 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 transition-all transform hover:-translate-y-0.5"
                >
                  {isSigning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying signature...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Execute Legal Agreement</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Action for Proforma / Invoice (Payment gateway) */}
            {((activeDocument.type === 'Proforma' || activeDocument.type === 'Invoice') && activeDocument.status !== 'Paid' && !isPaid) && (
              <button
                onClick={() => setShowPayModal(true)}
                className="px-6 py-3 rounded-2xl bg-[#10b981] hover:bg-[#059669] text-white text-[13px] font-bold shadow-lg shadow-emerald-500/10 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>Settle Invoice via Card</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Credit Card Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4 fade-in">
            <button 
              onClick={() => setShowPayModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <CreditCard className="w-5 h-5 text-brand-cyan" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Settle Invoice Payment</h3>
            </div>

            <p className="text-[13px] text-slate-400">
              Please enter your test payment details to settle quotation <span className="font-mono text-brand-pink font-bold">[{activeDocument.quote_no}]</span>.
            </p>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount Due</label>
                <div className="bg-slate-950/50 border border-slate-900 rounded-xl px-3 py-2 text-[13px] font-bold text-brand-cyan font-mono">
                  {activeDocument.grand_total.toLocaleString()} LKR
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Card Number</label>
                <input
                  type="text"
                  placeholder="4000 1234 5678 9010"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM / YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPaying}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-all"
              >
                {isPaying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing payment gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Pay Settle Amount</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
