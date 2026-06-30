import React, { useState } from 'react';
import { Share2, Play, Users, MessageSquare, Send, CheckCircle, RefreshCw, BarChart } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import confetti from 'canvas-confetti';

export default function MarketingHub() {
  const [campaignTitle, setCampaignTitle] = useState('New Eco-Packaging Design Offer');
  const [campaignMsg, setCampaignMsg] = useState('Hi [Client], check out PixelWave\'s new biodegradable gold-foiled pouch designs! Upgrade your packaging today and get 10% off. Secure link: pixelwave.lk/offer');
  
  const [selectedClients, setSelectedClients] = useState(['sub-1', 'sub-2', 'sub-3']);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [broadcastLogs, setBroadcastLogs] = useState([]);
  const [hasSent, setHasSent] = useState(false);

  const clients = [
    { id: 'sub-1', name: 'Topleaf Plantations Pvt Ltd', phone: '+94 77 123 4567' },
    { id: 'sub-2', name: 'Green Field Tea Exporters', phone: '+94 11 255 8899' },
    { id: 'sub-3', name: 'TechStart Hub (Asia)', phone: '+94 77 987 6543' },
    { id: 'sub-4', name: 'Lanka Crafted Gifts', phone: '+94 11 502 2011' }
  ];

  // Recharts Data
  const chartData = [
    { name: 'Delivered / Received', value: 85, color: '#10b981' },
    { name: 'Opened / Read', value: 65, color: '#009eff' },
    { name: 'Failed / Rejected', value: 5, color: '#fc0fc0' }
  ];

  const handleClientToggle = (id) => {
    if (selectedClients.includes(id)) {
      setSelectedClients(selectedClients.filter(cId => cId !== id));
    } else {
      setSelectedClients([...selectedClients, id]);
    }
  };

  const launchCampaign = async () => {
    if (selectedClients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }
    
    setIsSending(true);
    setProgress(0);
    setHasSent(false);
    setBroadcastLogs([]);

    const steps = [
      { log: '🔗 n8n Webhook Trigger: Initializing Bulk campaign node...', wait: 600 },
      { log: '👥 Extracting phone numbers and custom greeting parameters...', wait: 500 },
      { log: '🤖 [n8n AI Agent] Personalizing messages using Gemini API...', wait: 800 },
      { log: '🚀 Dispatching Meta WhatsApp Cloud API payloads...', wait: 1000 },
      { log: '📦 Syncing campaign performance to Supabase tracking tables...', wait: 600 }
    ];

    for (let i = 0; i < steps.length; i++) {
      setBroadcastLogs(prev => [...prev, steps[i].log]);
      setProgress(Math.round(((i + 1) / steps.length) * 100));
      await new Promise(resolve => setTimeout(resolve, steps[i].wait));
    }

    setIsSending(false);
    setHasSent(true);

    confetti({
      particleCount: 120,
      spread: 70,
      colors: ['#009eff', '#fc0fc0', '#10b981']
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          n8n Automated Marketing Hub
        </h2>
        <p className="text-slate-400 text-sm">
          Compose promotions and launch automated bulk WhatsApp messages to your client database via n8n integration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Campaign Composer (Span 7) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-5">
          <h3 className="text-sm font-bold text-white tracking-wider uppercase border-b border-slate-850 pb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-pink" />
            <span>WhatsApp Campaign Composer</span>
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Campaign Title</label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-[13px] text-slate-100 focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Message Content (SLA Template)</label>
              <textarea
                rows="4"
                value={campaignMsg}
                onChange={(e) => setCampaignMsg(e.target.value)}
                className="w-full bg-slate-950/40 border border-slate-850 rounded-xl p-3 text-[13px] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-blue leading-relaxed font-mono"
              ></textarea>
              <span className="text-[10px] text-slate-500">Variables like [Client] are parsed automatically by the n8n AI node.</span>
            </div>

            {/* Recipients check-list */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Select Clients</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                {clients.map(c => {
                  const isChecked = selectedClients.includes(c.id);
                  return (
                    <div 
                      key={c.id} 
                      onClick={() => handleClientToggle(c.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-[13px] cursor-pointer transition-all duration-300 ${
                        isChecked 
                          ? 'bg-brand-blue/15 border-brand-blue text-white font-medium' 
                          : 'bg-slate-950/20 border-slate-850 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        readOnly
                        className="accent-brand-blue pointer-events-none"
                      />
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{c.phone}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Launch simulation */}
            <div className="pt-2">
              {isSending ? (
                <div className="space-y-3">
                  <div className="w-full bg-slate-950/40 rounded-full h-2 overflow-hidden border border-slate-900">
                    <div className="bg-gradient-to-r from-brand-blue to-brand-pink h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="flex gap-2.5 items-center text-[13px] font-mono text-slate-400">
                    <RefreshCw className="w-3.5 h-3.5 text-brand-cyan animate-spin" />
                    <span>{broadcastLogs[broadcastLogs.length - 1]}</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={launchCampaign}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-pink hover:from-brand-blue/95 hover:to-brand-pink/95 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/10 transform hover:-translate-y-0.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Launch WhatsApp Broadcast via n8n</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Broadcast Analytics (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 bg-slate-950/15 space-y-4">
            <h3 className="text-[13px] font-bold text-white tracking-wider uppercase border-b border-slate-850 pb-3 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-brand-cyan" />
              <span>Broadcast Delivery Rates</span>
            </h3>

            {/* Chart Area */}
            <div className="h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend checklist */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-900 text-center">
              {chartData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <span className={`w-2 h-2 rounded-full inline-block mr-1`} style={{ backgroundColor: item.color }}></span>
                  <span className="text-[11px] text-slate-400 block font-medium">{item.name.split(' / ')[0]}</span>
                  <span className="text-sm font-bold text-white font-mono">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick SLA report summary */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 text-[13px] text-slate-400 leading-relaxed font-medium">
            <h4 className="font-bold text-slate-200 mb-1">📢 Meta Business SLA notice</h4>
            WhatsApp Cloud API rates apply (0.015 USD per business-initiated conversation in Sri Lanka). n8n automates opt-out responses to comply with privacy regulations.
          </div>
        </div>
      </div>
    </div>
  );
}
