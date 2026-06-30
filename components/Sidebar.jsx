import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, Globe, Cpu, ChevronRight, ChevronDown,
  Settings, Users, Calendar, DollarSign, Briefcase, Share2, Truck, TrendingUp,
  Menu, X
} from 'lucide-react';

const menuGroups = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    items: [
      { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Sales & Documents',
    icon: FileText,
    items: [
      { id: 'editor', label: 'AI Doc Builder', icon: FileText },
      { id: 'pricing', label: 'Pricing Calculator', icon: DollarSign },
      { id: 'portal', label: 'Client Portal', icon: Globe },
    ]
  },
  {
    label: 'Operations',
    icon: Briefcase,
    items: [
      { id: 'kanban', label: 'Production Kanban', icon: Briefcase },
      { id: 'calendar', label: 'Operations Planner', icon: Calendar },
      { id: 'suppliers', label: 'Supplier Tracker', icon: Truck },
    ]
  },
  {
    label: 'Marketing & AI',
    icon: Share2,
    items: [
      { id: 'marketing', label: 'n8n Campaigns', icon: Share2 },
      { id: 'n8n', label: 'n8n AI Workflows', icon: Cpu },
    ]
  },
  {
    label: 'Finance',
    icon: TrendingUp,
    items: [
      { id: 'pnl', label: 'P&L Tracker', icon: TrendingUp },
    ]
  },
  {
    label: 'CRM',
    icon: Users,
    items: [
      { id: 'clients', label: 'Clients & Subs', icon: Users },
    ]
  },
  {
    label: 'Settings',
    icon: Settings,
    items: [
      { id: 'customizer', label: 'Brand Customizer', icon: Settings },
    ]
  },
];

export default function Sidebar({ activeTab, setActiveTab, isDark, expanded, setExpanded }) {
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initial = {};
    menuGroups.forEach((group) => {
      initial[group.label] = group.items.some(i => i.id === 'dashboard');
    });
    return initial;
  });

  // Auto-expand group containing active tab
  useEffect(() => {
    setExpandedGroups(prev => {
      const next = { ...prev };
      menuGroups.forEach((group) => {
        if (group.items.some(i => i.id === activeTab)) {
          next[group.label] = true;
        }
      });
      return next;
    });
  }, [activeTab]);

  const toggleGroup = (label) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const ToggleIcon = expanded ? X : Menu;

  return (
    <aside className={`h-full flex flex-col border-r no-print transition-all duration-300 overflow-hidden flex-shrink-0
      ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/60 border-slate-200'}
      ${expanded ? 'w-64' : 'w-16'}`}
    >
      <div className={`flex flex-col flex-1 ${expanded ? 'p-4' : 'p-2'}`}>
        <div className={`flex items-center gap-2 mb-6 ${expanded ? 'justify-between' : 'justify-center'}`}>
          {expanded && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-gradient-to-tr from-brand-blue to-brand-pink p-[1px] shadow-lg shadow-brand-blue/10">
                <div className="w-full h-full bg-[#090d16] rounded-lg flex items-center justify-center overflow-hidden p-1">
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
              </div>
              <div className="min-w-0">
                <h1 className={`text-sm font-bold tracking-tight flex items-center gap-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Pixel<span className="text-brand-pink">Wave</span>
                </h1>
                <span className="text-[11px] tracking-wider uppercase font-semibold text-brand-cyan/80">
                  Business OS
                </span>
              </div>
            </div>
          )}
          {!expanded && (
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-tr from-brand-blue to-brand-pink p-[1px] shadow-lg shadow-brand-blue/10">
              <div className="w-full h-full bg-[#090d16] rounded-lg flex items-center justify-center overflow-hidden p-1">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  <defs>
                    <linearGradient id="logoGradS" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#009eff" />
                      <stop offset="100%" stopColor="#fc0fc0" />
                    </linearGradient>
                  </defs>
                  <path d="M10 30 C15 25, 20 20, 20 12 C20 12, 23 18, 25 22 L22 28 Z" fill="url(#logoGradS)" />
                  <circle cx="12" cy="12" r="3" fill="#009eff" />
                  <circle cx="28" cy="28" r="3" fill="#fc0fc0" />
                </svg>
              </div>
            </div>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300
              ${isDark
                ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-700'
              }`}
            title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ToggleIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        <nav className="space-y-0.5 flex-1 overflow-y-auto">
          {expanded
            ? menuGroups.map((group) => {
                const GroupIcon = group.icon;
                const isActiveGroup = group.items.some(i => i.id === activeTab);
                const isExpanded = expandedGroups[group.label];

                return (
                  <div key={group.label} className="mb-0.5">
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all
                        ${isActiveGroup && isExpanded
                          ? isDark ? 'text-brand-cyan' : 'text-brand-blue'
                          : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      <GroupIcon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="flex-1 text-left truncate">{group.label}</span>
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                    {isExpanded && (
                      <div className="ml-1 space-y-0.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => setActiveTab(item.id)}
                              className={`flex items-center rounded-xl text-sm font-semibold transition-all duration-300 w-full px-3 py-2 justify-between
                                ${activeTab === item.id
                                  ? isDark
                                    ? 'bg-gradient-to-r from-brand-blue/20 to-brand-pink/5 text-white shadow-lg shadow-brand-blue/5'
                                    : 'bg-gradient-to-r from-brand-blue/10 to-brand-pink/5 text-brand-blue shadow-sm border border-brand-blue/10'
                                  : isDark
                                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                    : 'text-slate-600 hover:text-brand-blue hover:bg-brand-blue/5'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${activeTab === item.id ? (isDark ? 'text-brand-cyan' : 'text-brand-blue') : ''}`} />
                                <span className="truncate">{item.label}</span>
                              </div>
                              <ChevronRight
                                className={`w-3.5 h-3.5 transition-all duration-300 ${
                                  activeTab === item.id ? 'opacity-100 translate-x-0 text-brand-blue' : 'opacity-0 -translate-x-2'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            : menuGroups.flatMap(group => group.items).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-12 h-10 mx-auto flex items-center justify-center rounded-xl transition-all duration-300
                      ${activeTab === item.id
                        ? isDark
                          ? 'bg-gradient-to-r from-brand-blue/20 to-brand-pink/5 text-white shadow-lg shadow-brand-blue/5'
                          : 'bg-gradient-to-r from-brand-blue/10 to-brand-pink/5 text-brand-blue shadow-sm'
                        : isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          : 'text-slate-600 hover:text-brand-blue hover:bg-brand-blue/5'
                      }`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
        </nav>
      </div>

      {expanded && (
        <div className={`p-3 border-t ${isDark ? 'border-slate-800/60 bg-slate-950/20' : 'border-slate-200 bg-slate-50/50'}`}>
          <div className={`flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-200/50'}`}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-blue/40 to-brand-pink/40 flex items-center justify-center text-[11px] font-bold text-white shadow-inner flex-shrink-0">
              PW
            </div>
            <div className="overflow-hidden min-w-0">
              <p className={`text-[13px] font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>PixelWave</p>
              <p className="text-[10px] text-slate-500 truncate">saas-admin@pixelwave.lk</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}