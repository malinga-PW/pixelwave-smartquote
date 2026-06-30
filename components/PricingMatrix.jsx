import React, { useState } from 'react';
import { DollarSign, Cpu, HelpCircle, Save, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PricingMatrix() {
  // Base cost state variables
  const [paperBoardCost, setPaperBoardCost] = useState(150); // LKR per unit
  const [screenPrepBase, setScreenPrepBase] = useState(1500); // LKR setup
  const [tshirtBlankCost, setTshirtBlankCost] = useState(600); // LKR per blank
  const [laserRunRate, setLaserRunRate] = useState(50); // LKR per minute
  const [devHourlyRate, setDevHourlyRate] = useState(8000); // LKR per hour

  // Markup percentage state
  const [targetMarkup, setTargetMarkup] = useState(30); // 30%
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [notification, setNotification] = useState('');

  // AI Margin Optimization simulation
  const runAiOptimization = () => {
    setIsOptimizing(true);
    setAiReport('');
    
    setTimeout(() => {
      setIsOptimizing(false);
      setTargetMarkup(45); // AI suggests raising margins to 45% based on demand
      setAiReport('💡 [Gemini AI Pricing Expert] Recommendation: Material cost index in Colombo rose by 8.5%. However, current conversion analytics show strong pricing elasticity for Packaging Design and Automation workflows. Suggest raising base markups to 45% to maximize yield while maintaining conversion.');
      
      confetti({
        particleCount: 50,
        spread: 30,
        colors: ['#009eff', '#fc0fc0']
      });
    }, 2000);
  };

  const handleSaveMatrix = () => {
    setNotification('⚡ Pricing Matrix rules successfully updated in staging.');
    setTimeout(() => setNotification(''), 4000);
    
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });
  };

  // Pricing calculations
  const calcPrice = (base, qtyFactor = 1) => {
    const markupFactor = 1 + (targetMarkup / 100);
    return Math.round(base * markupFactor * qtyFactor);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            AI Pricing Matrix
          </h2>
          <p className="text-slate-400 text-sm">
            Control base operational variables and let the Gemini pricing engine optimize target profit margins.
          </p>
        </div>
        <button
          onClick={handleSaveMatrix}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-pink hover:from-brand-blue/95 hover:to-brand-pink/95 text-white text-sm font-semibold shadow-lg shadow-brand-blue/10 flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Save className="w-4 h-4" />
          <span>Save Pricing Rules</span>
        </button>
      </div>

      {notification && (
        <div className="bg-emerald-950/15 border border-emerald-900/30 p-4 rounded-xl text-xs text-emerald-400 font-mono">
          {notification}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Base Cost Form (Span 7) */}
        <div className="md:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-6">
          <h3 className="text-sm font-bold text-white tracking-wider uppercase border-b border-slate-850 pb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-brand-cyan" />
            <span>Base Production Cost Factors</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Paper Board */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paper Board Cost (LKR/unit)</label>
              <input
                type="number"
                value={paperBoardCost}
                onChange={(e) => setPaperBoardCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
              />
              <span className="text-[9px] text-slate-500">Includes lamination and material board costs.</span>
            </div>

            {/* Screen prep */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Screen Prep Setup (LKR)</label>
              <input
                type="number"
                value={screenPrepBase}
                onChange={(e) => setScreenPrepBase(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
              />
              <span className="text-[9px] text-slate-500">Plastisol screens & frame alignment labor fee.</span>
            </div>

            {/* Cotton shirts */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">T-Shirt Blank Sourcing (LKR)</label>
              <input
                type="number"
                value={tshirtBlankCost}
                onChange={(e) => setTshirtBlankCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
              />
              <span className="text-[9px] text-slate-500">200 GSM organic cotton knit blanks.</span>
            </div>

            {/* Laser rate */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Laser Engraving Run (LKR/min)</label>
              <input
                type="number"
                value={laserRunRate}
                onChange={(e) => setLaserRunRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
              />
              <span className="text-[9px] text-slate-500">Fiber laser lens runtime depreciation.</span>
            </div>

            {/* Dev rate */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">n8n Custom Dev Hourly SLA (LKR)</label>
              <input
                type="number"
                value={devHourlyRate}
                onChange={(e) => setDevHourlyRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
              />
              <span className="text-[9px] text-slate-500">Custom workflow engineering and testing services rate.</span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Optimizer & Matrix Outputs (Span 5) */}
        <div className="md:col-span-5 space-y-6">
          {/* AI Optimizer Panel */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 bg-slate-950/15 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-pink" />
                <span>Gemini Pricing Optimizer</span>
              </h3>
              <span className="text-[9px] px-2 py-0.5 rounded bg-brand-pink/10 border border-brand-pink/20 text-brand-pink font-semibold">Active</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4 justify-between bg-slate-950/30 p-3 rounded-xl border border-slate-850">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Target Profit Markup</span>
                  <span className="text-xl font-bold text-white font-mono">{targetMarkup}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={targetMarkup}
                  onChange={(e) => setTargetMarkup(parseInt(e.target.value))}
                  className="w-32 accent-brand-blue"
                />
              </div>

              {isOptimizing ? (
                <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-brand-cyan animate-spin" />
                  <span className="text-[10px] font-mono text-slate-400">Gemini analyzing pricing matrices...</span>
                </div>
              ) : (
                <button
                  onClick={runAiOptimization}
                  className="w-full py-2.5 rounded-xl bg-slate-950/60 border border-brand-pink hover:bg-brand-pink/10 text-brand-pink text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Analyze & Optimize Margins</span>
                </button>
              )}

              {aiReport && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-[10px] text-slate-300 leading-relaxed font-medium">
                  {aiReport}
                </div>
              )}
            </div>
          </div>

          {/* Calculator Output Preview */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 bg-slate-950/15 space-y-4">
            <h3 className="text-xs font-bold text-white tracking-wider uppercase border-b border-slate-850 pb-3">
              Recommended Unit Prices (LKR)
            </h3>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center bg-slate-950/20 px-3.5 py-2 rounded-xl border border-slate-850/60">
                <span className="text-slate-400 text-[10px] font-sans">Cardboard Packaging Box (500 units)</span>
                <span className="text-slate-100 font-bold">{calcPrice(paperBoardCost).toLocaleString()} LKR</span>
              </div>

              <div className="flex justify-between items-center bg-slate-950/20 px-3.5 py-2 rounded-xl border border-slate-850/60">
                <span className="text-slate-400 text-[10px] font-sans">Branded T-Shirt (200 units print run)</span>
                <span className="text-slate-100 font-bold">{(calcPrice(tshirtBlankCost) + Math.round(screenPrepBase / 200)).toLocaleString()} LKR</span>
              </div>

              <div className="flex justify-between items-center bg-slate-950/20 px-3.5 py-2 rounded-xl border border-slate-850/60">
                <span className="text-slate-400 text-[10px] font-sans">Laser Engraved Journal (10 min run)</span>
                <span className="text-slate-100 font-bold">{calcPrice(laserRunRate, 10).toLocaleString()} LKR</span>
              </div>

              <div className="flex justify-between items-center bg-slate-950/20 px-3.5 py-2 rounded-xl border border-slate-850/60">
                <span className="text-slate-400 text-[10px] font-sans">Automation Integration (40 hours SLA)</span>
                <span className="text-slate-100 font-bold">{calcPrice(devHourlyRate, 40).toLocaleString()} LKR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
