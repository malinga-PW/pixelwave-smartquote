'use client';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';

const ADMIN_PASSWORD = 'Admin@775718';
const SESSION_KEY    = 'pw_admin_auth';

export default function LoginScreen({ onAuthenticated }) {
  const [pw,        setPw]        = useState('');
  const [show,      setShow]      = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [unlocked,  setUnlocked]  = useState(false);
  const [attempts,  setAttempts]  = useState(0);
  const [blocked,   setBlocked]   = useState(false);
  const [blockTimer,setBlockTimer]= useState(0);

  // Block countdown
  useEffect(() => {
    if (blocked && blockTimer > 0) {
      const t = setTimeout(() => setBlockTimer(s => s - 1), 1000);
      return () => clearTimeout(t);
    }
    if (blocked && blockTimer === 0) setBlocked(false);
  }, [blocked, blockTimer]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (blocked) return;

    setLoading(true);
    setError('');

    setTimeout(() => {
      if (pw === ADMIN_PASSWORD) {
        setUnlocked(true);
        sessionStorage.setItem(SESSION_KEY, 'true');
        setTimeout(() => onAuthenticated(), 1000);
      } else {
        const next = attempts + 1;
        setAttempts(next);
        setLoading(false);
        if (next >= 5) {
          setBlocked(true);
          setBlockTimer(30);
          setError('Too many failed attempts. Locked for 30 seconds.');
        } else {
          setError(`Incorrect password. ${5 - next} attempt(s) remaining.`);
        }
        setPw('');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-pink/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-cyan/5 rounded-full blur-2xl" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Login Card */}
      <div className={`relative z-10 w-full max-w-sm transition-all duration-700 ${unlocked ? 'scale-105 opacity-0' : 'scale-100 opacity-100'}`}>
        {/* Logo header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue/30 to-brand-pink/20 border border-brand-blue/30 shadow-lg shadow-brand-blue/10 mb-2">
            <ShieldCheck className={`w-8 h-8 ${unlocked ? 'text-emerald-400' : 'text-brand-cyan'} transition-colors duration-300`} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">PixelWave Admin</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">PixelWave Business OS · Secure Access</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-black/30 space-y-5">
          {unlocked ? (
            <div className="text-center space-y-3 py-4">
              <div className="inline-flex w-12 h-12 rounded-full bg-emerald-900/20 border border-emerald-700/30 items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-emerald-400">Access Granted</p>
              <p className="text-[10px] text-slate-500">Redirecting to Command Center…</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Admin Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={show ? 'text' : 'password'}
                    value={pw}
                    onChange={e => { setPw(e.target.value); setError(''); }}
                    placeholder="Enter admin password"
                    disabled={blocked}
                    autoFocus
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-10 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-blue/60 focus:ring-1 focus:ring-brand-blue/20 transition-all font-mono disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-[10px] font-semibold text-red-400 bg-red-950/20 border border-red-900/30 rounded-xl px-3 py-2">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{error}</span>
                  {blocked && <span className="ml-auto font-mono text-orange-400">({blockTimer}s)</span>}
                </div>
              )}

              <button
                type="submit"
                disabled={!pw || loading || blocked}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-pink text-white text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/15 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Verifying…
                  </span>
                ) : 'Unlock Dashboard'}
              </button>
            </form>
          )}

          {/* Security footer */}
          <div className="pt-2 border-t border-slate-800/60 text-center">
            <p className="text-[9px] text-slate-600 font-mono">🔒 PixelWave Solutions · Internal Admin Access</p>
          </div>
        </div>
      </div>
    </div>
  );
}
