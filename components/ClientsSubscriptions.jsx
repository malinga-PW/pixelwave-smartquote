import React, { useState, useEffect } from 'react';
import { 
  Users, Globe, Calendar, DollarSign, 
  UserPlus, Bell, Pause, Play, Trash2, ArrowUpRight, ShieldCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabaseClient';

export default function ClientsSubscriptions() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscriptions() {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, customers(name)')
        .order('created_at', { ascending: false });

      if (data) {
        setClients(data.map(sub => ({
          id: sub.id,
          name: sub.customers?.name || sub.company,
          company: sub.company,
          plan: sub.plan_name,
          fee: Number(sub.monthly_fee),
          subdomain: sub.subdomain,
          renewal: sub.renewal_date,
          status: sub.status
        })));
      }
      setLoading(false);
    }
    fetchSubscriptions();
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPlan, setNewPlan] = useState('Hosting & SmartQuote Bundle');
  const [newFee, setNewFee] = useState(15000);
  const [newSubdomain, setNewSubdomain] = useState('');
  const [newRenewal, setNewRenewal] = useState('');
  const [notification, setNotification] = useState('');

  // Calculations
  const activeCount = clients.filter(c => c.status === 'Active').length;
  const pendingCount = clients.filter(c => c.status === 'Pending').length;
  const totalMRR = clients
    .filter(c => c.status === 'Active')
    .reduce((sum, c) => sum + c.fee, 0);

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newName || !newSubdomain) {
      alert('Please fill out Name and Subdomain');
      return;
    }

    // 1. Get or create customer
    let customerId = null;
    const { data: existingCust } = await supabase
      .from('customers')
      .select('id')
      .eq('name', newName)
      .limit(1);

    if (existingCust && existingCust.length > 0) {
      customerId = existingCust[0].id;
    } else {
      const { data: newCust } = await supabase
        .from('customers')
        .insert({
          name: newName,
          company: newCompany || newName
        })
        .select();
      if (newCust && newCust.length > 0) {
        customerId = newCust[0].id;
      }
    }

    const subdomainFormatted = newSubdomain.toLowerCase().endsWith('.pixelwave.lk') 
      ? newSubdomain.toLowerCase() 
      : `${newSubdomain.toLowerCase()}.pixelwave.lk`;

    const nextRenewalDate = newRenewal || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newSub = {
      customer_id: customerId,
      plan_name: newPlan,
      monthly_fee: parseFloat(newFee) || 0,
      subdomain: subdomainFormatted,
      renewal_date: nextRenewalDate,
      company: newCompany || newName,
      status: 'Active'
    };

    const { data, error } = await supabase.from('subscriptions').insert(newSub).select('*, customers(name)');
    if (data && data.length > 0) {
      const added = {
        id: data[0].id,
        name: data[0].customers?.name || data[0].company,
        company: data[0].company,
        plan: data[0].plan_name,
        fee: Number(data[0].monthly_fee),
        subdomain: data[0].subdomain,
        renewal: data[0].renewal_date,
        status: data[0].status
      };

      setClients(prev => [added, ...prev]);
      setShowAddModal(false);
      
      // Clear form
      setNewName('');
      setNewCompany('');
      setNewSubdomain('');
      setNewRenewal('');

      // Confetti
      confetti({
        particleCount: 80,
        spread: 50,
        colors: ['#009eff', '#0b54fe']
      });

      setNotification(`Client ${added.name} added to subscriptions.`);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const handleStatusToggle = async (id) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    const nextStatus = client.status === 'Active' ? 'Suspended' : 'Active';
    
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: nextStatus })
      .eq('id', id)
      .select();
      
    if (data) {
      setClients(clients.map(c => c.id === id ? { ...c, status: nextStatus } : c));
    }
  };

  const handleSendReminder = (clientName) => {
    // n8n Whatsapp notification simulator
    setNotification(`n8n Trigger: Sent WhatsApp billing reminder to ${clientName}!`);
    setTimeout(() => setNotification(''), 4000);
    
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Clients & Subscriptions
          </h2>
          <p className="text-slate-400 text-sm">
            Manage your high-ticket website clients, subdomains, hosting plans, and recurring SLA contracts.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-pink hover:from-brand-blue/95 hover:to-brand-pink/95 text-white text-sm font-semibold shadow-lg shadow-brand-blue/10 flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Client Subscription</span>
        </button>
      </div>

      {/* Mini Alert Banner */}
      {notification && (
        <div className="bg-brand-blue/15 border border-brand-blue/30 p-4 rounded-xl text-xs text-brand-cyan font-mono animate-pulse">
          {notification}
        </div>
      )}

      {/* KPI Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-brand-cyan">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Recurring Revenue (MRR)</p>
              <h3 className="text-2xl font-bold text-white mt-1.5">{totalMRR.toLocaleString()} LKR</h3>
            </div>
            <div className="p-2.5 bg-brand-blue/10 rounded-xl">
              <DollarSign className="w-5 h-5 text-brand-cyan" />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-brand-pink">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Hosting Web Clients</p>
              <h3 className="text-2xl font-bold text-white mt-1.5">{activeCount} Sites</h3>
            </div>
            <div className="p-2.5 bg-brand-pink/10 rounded-xl">
              <Globe className="w-5 h-5 text-brand-pink" />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending / Invoice Overdue</p>
              <h3 className="text-2xl font-bold text-white mt-1.5">{pendingCount} Clients</h3>
            </div>
            <div className="p-2.5 bg-amber-500/10 rounded-xl">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Clients Subscription Repository List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clients.map((client) => (
          <div 
            key={client.id}
            className={`glass-panel rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden group ${
              client.status === 'Active' 
                ? 'border-slate-800/80 hover:border-brand-blue/30' 
                : client.status === 'Pending' 
                  ? 'border-amber-900/30 bg-amber-950/5' 
                  : 'border-red-900/30 bg-red-950/5 opacity-60'
            }`}
          >
            {/* Header info */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${
                  client.status === 'Active' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' :
                  client.status === 'Pending' ? 'bg-amber-950/40 text-amber-400 border-amber-900/40' :
                  'bg-red-950/40 text-red-400 border-red-900/40'
                }`}>
                  {client.status}
                </span>
                <h3 className="text-base font-bold text-white mt-2.5">{client.name}</h3>
                <p className="text-xs text-slate-400 font-medium">{client.plan}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">Monthly Retainer</span>
                <span className="text-base font-black text-brand-cyan font-mono">{client.fee.toLocaleString()} LKR</span>
              </div>
            </div>

            {/* Subdomain & Renewal date details */}
            <div className="mt-6 pt-4 border-t border-slate-850 flex flex-wrap gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-850">
                <Globe className="w-3.5 h-3.5 text-brand-blue" />
                <span className="font-mono text-[10px] text-slate-300">{client.subdomain}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-850">
                <Calendar className="w-3.5 h-3.5 text-brand-pink" />
                <span>Next Renewal: <span className="font-mono text-[10px] text-slate-300">{client.renewal}</span></span>
              </div>
            </div>

            {/* Actions for subscription card */}
            <div className="mt-6 flex justify-between items-center gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleSendReminder(client.company)}
                  className="px-3 py-2 rounded-xl bg-slate-950/50 hover:bg-brand-blue/10 border border-slate-850 hover:border-brand-blue/30 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Bell className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Send n8n Billing Remind</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusToggle(client.id)}
                  title={client.status === 'Active' ? 'Suspend Subscription' : 'Activate Subscription'}
                  className={`p-2 rounded-xl border transition-all ${
                    client.status === 'Active'
                      ? 'bg-slate-950/50 border-slate-850 hover:border-red-900/30 hover:bg-red-950/10 text-slate-400 hover:text-red-400'
                      : 'bg-emerald-950/20 border-emerald-900/20 hover:border-emerald-500 text-emerald-400'
                  }`}
                >
                  {client.status === 'Active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tr from-brand-blue/5 to-transparent rounded-full blur-md -mr-10 -mb-10 group-hover:scale-125 transition-transform duration-500"></div>
          </div>
        ))}
      </div>

      {/* Add Client Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
            >
              <Trash2 className="w-4 h-4 transform rotate-45" />
            </button>
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <UserPlus className="w-5 h-5 text-brand-pink" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">New Web Client Subscription</h3>
            </div>

            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Ceylon Artisans Ltd"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Company / Brand Name</label>
                <input
                  type="text"
                  placeholder="E.g., Ceylon Artisans"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Subscription Plan</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                >
                  <option value="Hosting & SmartQuote Bundle">Hosting & SmartQuote Bundle</option>
                  <option value="Premium E-Commerce SLA">Premium E-Commerce SLA</option>
                  <option value="Automation & SaaS Care">Automation & SaaS Care</option>
                  <option value="Basic Web Hosting & Support">Basic Web Hosting & Support</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Monthly Retainer (LKR)</label>
                  <input
                    type="number"
                    required
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Subdomain</label>
                  <input
                    type="text"
                    required
                    placeholder="artisans"
                    value={newSubdomain}
                    onChange={(e) => setNewSubdomain(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Renewal Date</label>
                <input
                  type="date"
                  value={newRenewal}
                  onChange={(e) => setNewRenewal(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-pink hover:from-brand-blue/95 hover:to-brand-pink/95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/10 transition-all"
              >
                <span>Activate Subscription SLA</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
