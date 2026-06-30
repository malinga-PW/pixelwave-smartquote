import React, { useState } from 'react';
import { Settings, Save, Globe, Eye, Palette, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BrandCustomizer() {
  const [brandTitle, setBrandTitle] = useState('PixelWave Solutions');
  const [subdomain, setSubdomain] = useState('smartquote.pixelwave.lk');
  
  // Custom brand colors (mock values)
  const [colorPrimary, setColorPrimary] = useState('#0b54fe');
  const [colorSecondary, setColorSecondary] = useState('#fc0fc0');
  
  const [themeMode, setThemeMode] = useState('dark');
  const [notification, setNotification] = useState('');

  const handleSaveBranding = () => {
    setNotification('⚡ White-Label branding configuration successfully synced to SaaS registry.');
    setTimeout(() => setNotification(''), 4000);
    
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            White-Label Brand Customizer
          </h2>
          <p className="text-slate-400 text-sm">
            Modify colors, subdomains, and logomarks to white-label the SmartQuote Client Portal for your agency.
          </p>
        </div>
        <button
          onClick={handleSaveBranding}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-pink hover:from-brand-blue/95 hover:to-brand-pink/95 text-white text-sm font-semibold shadow-lg shadow-brand-blue/10 flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Save className="w-4 h-4" />
          <span>Save Branding</span>
        </button>
      </div>

      {notification && (
        <div className="bg-emerald-950/15 border border-emerald-900/30 p-4 rounded-xl text-xs text-emerald-400 font-mono">
          {notification}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Customizer Fields (Span 7) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-6">
          <h3 className="text-sm font-bold text-white tracking-wider uppercase border-b border-slate-850 pb-3 flex items-center gap-2">
            <Palette className="w-4 h-4 text-brand-cyan" />
            <span>Brand Styling Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company / Agency Title</label>
              <input
                type="text"
                value={brandTitle}
                onChange={(e) => setBrandTitle(e.target.value)}
                className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
              />
            </div>

            {/* Subdomain */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Connected Domain / CNAME</label>
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
              />
            </div>

            {/* Primary Color */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Brand Color</label>
              <div className="flex gap-2.5">
                <input
                  type="color"
                  value={colorPrimary}
                  onChange={(e) => setColorPrimary(e.target.value)}
                  className="w-10 h-8 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                />
                <input
                  type="text"
                  value={colorPrimary}
                  onChange={(e) => setColorPrimary(e.target.value)}
                  className="flex-1 bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Secondary Brand Color</label>
              <div className="flex gap-2.5">
                <input
                  type="color"
                  value={colorSecondary}
                  onChange={(e) => setColorSecondary(e.target.value)}
                  className="w-10 h-8 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                />
                <input
                  type="text"
                  value={colorSecondary}
                  onChange={(e) => setColorSecondary(e.target.value)}
                  className="flex-1 bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
                />
              </div>
            </div>

            {/* Default Theme */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Default Portal Theme</label>
              <div className="flex bg-slate-950/50 p-1 border border-slate-850 rounded-xl">
                {['light', 'dark', 'system'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setThemeMode(mode)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all duration-300 ${
                      themeMode === mode
                        ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Style Preview Banner (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 bg-slate-950/15 space-y-4">
            <h3 className="text-xs font-bold text-white tracking-wider uppercase border-b border-slate-850 pb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-cyan" />
              <span>Portal Invoice Header Preview</span>
            </h3>

            {/* Style Preview Container */}
            <div className="bg-white text-slate-950 p-6 rounded-2xl border border-slate-150 space-y-4 shadow-lg select-none">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colorPrimary} 0%, ${colorSecondary} 100%)` }}>
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold tracking-tight text-slate-900">{brandTitle}</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: colorPrimary }}>Invoice</span>
                  <p className="text-xs font-black text-slate-900 mt-0.5">INV-2026-X</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-400 font-semibold">Total Settle Sum:</span>
                <span className="text-sm font-bold font-mono" style={{ color: colorPrimary }}>450,000.00 LKR</span>
              </div>
            </div>
          </div>

          {/* Subdomain routing tip */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 text-xs text-slate-400 leading-relaxed font-medium space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-brand-blue" />
              <span>CNAME DNS routing configuration</span>
            </h4>
            <p>
              To configure white-label subdomains, point your DNS CNAME record:
            </p>
            <div className="bg-slate-950/40 border border-slate-850 rounded-lg p-2 font-mono text-[9px] text-brand-cyan">
              CNAME: smartquote.pixelwave.lk ➔ cname.vercel-dns.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
