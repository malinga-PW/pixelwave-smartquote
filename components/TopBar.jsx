'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Sun, Moon, LogOut, Wifi, WifiOff, RefreshCw,
  Database, Activity, Zap, ChevronDown
} from 'lucide-react';

// Simulate realtime metrics
function useSystemMetrics() {
  const [metrics, setMetrics] = useState({
    supabase:      'connected',   // 'connected' | 'disconnected' | 'syncing'
    n8n:           'idle',        // 'idle' | 'running' | 'error'
    dataSpeed:     '1.2',         // MB/s
    transferBytes: '847',         // KB transferred this session
    ping:          '42',          // ms
    online:        true,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        dataSpeed:     (Math.random() * 3 + 0.5).toFixed(1),
        transferBytes: (parseInt(prev.transferBytes) + Math.floor(Math.random() * 50)).toString(),
        ping:          (Math.floor(Math.random() * 40 + 25)).toString(),
        online:        navigator.onLine,
        // Occasionally flip supabase to 'syncing' briefly
        supabase: Math.random() > 0.92 ? 'syncing' : 'connected',
        n8n:      Math.random() > 0.95 ? 'running' : 'idle',
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return metrics;
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

// Status dot
function StatusDot({ status }) {
  const map = {
    connected:    'bg-emerald-400 shadow-emerald-400/60',
    disconnected: 'bg-red-400 shadow-red-400/60',
    syncing:      'bg-amber-400 shadow-amber-400/60 animate-pulse',
    idle:         'bg-slate-500',
    running:      'bg-brand-cyan shadow-brand-cyan/60 animate-pulse',
    error:        'bg-red-400 shadow-red-400/60',
  };
  return (
    <span className={`w-1.5 h-1.5 rounded-full shadow-sm inline-block ${map[status] || 'bg-slate-500'}`} />
  );
}

export default function TopBar({ isDark, setIsDark, onLogout, isSupabaseConnected }) {
  const metrics = useSystemMetrics();
  const now     = useClock();
  const [showStatusPopover, setShowStatusPopover] = useState(false);

  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const formatBytes = (kb) => {
    const n = parseInt(kb);
    return n > 1024 ? `${(n / 1024).toFixed(1)} MB` : `${n} KB`;
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 h-7 flex items-center px-4 gap-0 select-none
        ${isDark
          ? 'bg-gradient-to-r from-[#0f1a2e]/95 via-[#0d1425]/95 to-[#0a0f1c]/95 border-b border-brand-blue/20 text-slate-300'
          : 'bg-gradient-to-r from-white/95 via-slate-50/95 to-white/95 border-b border-brand-blue/10 text-slate-700'
        }
        backdrop-blur-xl shadow-sm shadow-brand-blue/5`}
      style={{ fontSize: '11px' }}
    >
      {/* LEFT — Logo mark */}
      <div className="flex items-center gap-2 pr-4 border-r border-current/10 mr-3">
        <div className="w-3.5 h-3.5 rounded-sm bg-gradient-to-br from-brand-blue to-brand-pink flex items-center justify-center">
          <span className="text-[6px] text-white font-black leading-none">PW</span>
        </div>
        <span className={`font-bold tracking-tight text-[13px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
          PixelWave Admin
        </span>
      </div>

      {/* CENTER — Status indicators */}
      <div className="flex-1 flex items-center gap-4 overflow-x-auto">

        {/* Supabase status */}
        <div
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setShowStatusPopover(s => !s)}
        >
          <Database className="w-3 h-3 text-brand-cyan" />
          <StatusDot status={metrics.supabase} />
          <span className={`font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Supabase {metrics.supabase === 'syncing' ? 'Syncing…' : 'Live'}
          </span>
          <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
        </div>

        {/* Divider */}
        <span className="text-slate-700 opacity-30">|</span>

        {/* n8n sync */}
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-brand-pink" />
          <StatusDot status={metrics.n8n} />
          <span className={`font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            n8n {metrics.n8n === 'running' ? 'Running' : 'Idle'}
          </span>
        </div>

        {/* Divider */}
        <span className="text-slate-700 opacity-30">|</span>

        {/* Data transfer speed */}
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span className="font-mono font-semibold text-emerald-400">{metrics.dataSpeed} MB/s</span>
          <span className={`font-mono ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>↑ {formatBytes(metrics.transferBytes)}</span>
        </div>

        {/* Divider */}
        <span className="text-slate-700 opacity-30">|</span>

        {/* Ping */}
        <div className="flex items-center gap-1.5">
          <Wifi className={`w-3 h-3 ${metrics.online ? 'text-brand-blue' : 'text-red-400'}`} />
          <span className={`font-mono font-semibold ${metrics.ping < 50 ? 'text-emerald-400' : metrics.ping < 100 ? 'text-amber-400' : 'text-red-400'}`}>
            {metrics.ping} ms
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Database status */}
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400' : 'bg-brand-cyan animate-pulse'}`} />
          <span className={`font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {isSupabaseConnected ? 'DB: Connected (Supabase)' : 'DB: Offline Demo'}
          </span>
        </div>

        {/* Divider */}
        <span className="text-slate-700 opacity-30">|</span>

        {/* Domain */}
        <div className="flex items-center gap-1.5">
          <span className={`font-mono font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            smartquote.pixelwave.lk
          </span>
        </div>
      </div>

      {/* RIGHT — Clock + Theme toggle + Logout */}
      <div className="flex items-center gap-3 pl-3 border-l border-current/10">
        {/* Date & Time */}
        <div className={`flex items-center gap-2 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span>{dateStr}</span>
          <span className={`font-bold tabular-nums ${isDark ? 'text-white' : 'text-slate-800'}`}>{timeStr}</span>
        </div>

        {/* Light / Dark toggle */}
        <button
          onClick={() => setIsDark(d => !d)}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400'
              : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700'
          }`}
        >
          {isDark ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Lock & Logout"
          className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 ${
            isDark
              ? 'bg-slate-800 hover:bg-red-950/40 border border-slate-700 hover:border-red-900/50 text-slate-400 hover:text-red-400'
              : 'bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-500'
          }`}
        >
          <LogOut className="w-3 h-3" />
        </button>
      </div>

      {/* Status Popover */}
      {showStatusPopover && (
        <div
          className={`absolute top-8 left-40 z-50 w-64 rounded-2xl shadow-2xl shadow-black/30 border p-4 space-y-3 ${
            isDark
              ? 'bg-[#0f172a] border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800/30 pb-2">
            <h4 className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>System Status</h4>
            <button onClick={() => setShowStatusPopover(false)} className="text-slate-500 hover:text-slate-300 text-[13px]">✕</button>
          </div>

          {[
            { label: 'Supabase Database',    status: metrics.supabase,   icon: Database, detail: 'supabasekong-uh7w2l…' },
            { label: 'n8n Workflow Engine',  status: metrics.n8n,        icon: Zap,      detail: 'Webhook listener active' },
            { label: 'Internet Connection',  status: metrics.online ? 'connected' : 'disconnected', icon: Wifi, detail: `${metrics.ping}ms ping` },
            { label: 'Data Transfer',        status: 'connected',        icon: Activity, detail: `${metrics.dataSpeed} MB/s · ${formatBytes(metrics.transferBytes)} this session` },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-2.5">
                <div className={`mt-0.5 p-1 rounded-lg ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                  <Icon className="w-3 h-3 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-[11px] font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item.label}</p>
                    <StatusDot status={item.status} />
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 truncate">{item.detail}</p>
                </div>
              </div>
            );
          })}

          <div className={`pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'} flex items-center gap-1.5 text-[10px] font-mono ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            <RefreshCw className="w-2.5 h-2.5" />
            <span>Auto-refresh every 3s</span>
          </div>
        </div>
      )}
    </div>
  );
}
