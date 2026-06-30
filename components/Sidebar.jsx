import React from 'react';
import { 
  LayoutDashboard, FileText, Globe, Cpu, ChevronRight, 
  Settings, Users, Calendar, DollarSign, Briefcase, Share2 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'editor', label: 'AI Doc Builder', icon: FileText },
    { id: 'pricing', label: 'AI Pricing Matrix', icon: DollarSign },
    { id: 'kanban', label: 'Production Kanban', icon: Briefcase },
    { id: 'clients', label: 'Clients & Subs', icon: Users },
    { id: 'calendar', label: 'Operations Planner', icon: Calendar },
    { id: 'marketing', label: 'n8n Campaigns', icon: Share2 },
    { id: 'portal', label: 'Client Portal', icon: Globe },
    { id: 'customizer', label: 'Brand Customizer', icon: Settings },
    { id: 'n8n', label: 'n8n AI Workflows', icon: Cpu },
  ];

  return (
    <aside className="w-64 bg-slate-900/60 backdrop-blur-md border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 overflow-y-auto no-print">
      {/* Top Section */}
      <div className="p-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-tr from-brand-blue to-brand-pink p-[1px] shadow-lg shadow-brand-blue/10">
            <div className="w-full h-full bg-[#090d16] rounded-lg flex items-center justify-center overflow-hidden p-1">
              {/* SVG Logo Mark */}
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <defs>
                  <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#009eff" />
                    <stop offset="100%" stopColor="#fc0fc0" />
                  </linearGradient>
                </defs>
                <path d="M10 30 C15 25, 20 20, 20 12 C20 12, 23 18, 25 22 L22 28 Z" fill="url(#logoGrad)" />
                <circle cx="12" cy="12" r="3" fill="#009eff" />
                <circle cx="28" cy="28" r="3" fill="#fc0fc0" />
              </svg>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-brand-blue to-brand-pink rounded-lg blur opacity-30 -z-10"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
              Pixel<span className="text-brand-pink">Wave</span>
            </h1>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-brand-cyan/80">
              SmartQuote SaaS
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm group ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-blue/20 to-brand-pink/5 text-white border-l-4 border-brand-blue shadow-inner shadow-brand-blue/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                      isActive ? 'text-brand-cyan' : 'text-slate-400 group-hover:text-brand-blue'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-6 border-t border-slate-800/60 bg-slate-950/20">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/30 transition-all cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue/40 to-brand-pink/40 flex items-center justify-center text-xs font-bold text-white shadow-inner">
            PW
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">PixelWave Solutions</p>
            <p className="text-[10px] text-slate-500 truncate">saas-admin@pixelwave.lk</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
