import React, { useState, useMemo } from 'react';
import { 
  DollarSign, FileText, ClipboardList, CheckCircle2, 
  Search, Eye, ArrowRight, TrendingUp, Sparkles 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

export default function Dashboard({ documents, setViewDocument, setActiveTab }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Stats Calculations
  const stats = useMemo(() => {
    const totalRevenue = documents
      .filter(d => d.type === 'Invoice' || d.type === 'Order')
      .reduce((sum, d) => sum + d.grand_total, 0);

    const pendingSigns = documents.filter(d => d.type === 'Agreement' && d.status !== 'Signed').length;
    const activeOrders = documents.filter(d => d.type === 'Order' && d.status === 'In Production').length;
    const approvedQuotes = documents.filter(d => d.type === 'Quote' && d.status === 'Approved').length;

    return {
      totalRevenue,
      pendingSigns,
      activeOrders,
      approvedQuotes
    };
  }, [documents]);

  // Search and Filter logic
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = 
        doc.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.quote_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.items.some(item => item.item_title.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterType === 'All' || doc.type === filterType;
      
      return matchesSearch && matchesFilter;
    });
  }, [documents, searchTerm, filterType]);

  // Chart Data: Value by Document Type
  const chartData = useMemo(() => {
    const types = ['Quote', 'Proforma', 'Agreement', 'Order', 'Invoice'];
    return types.map(t => {
      const total = documents
        .filter(d => d.type === t)
        .reduce((sum, d) => sum + d.grand_total, 0);
      return {
        name: t === 'Proforma' ? 'Proforma (PI)' : t,
        value: total
      };
    });
  }, [documents]);

  const [chartView, setChartView] = useState('weekly'); // 'weekly' | 'monthly'

  // Weekly progression data — last 7 days
  const weeklyData = [
    { name: 'Mon', leads: 3,  quoteSent: 2, revenue: 45000  },
    { name: 'Tue', leads: 5,  quoteSent: 3, revenue: 78000  },
    { name: 'Wed', leads: 2,  quoteSent: 2, revenue: 32000  },
    { name: 'Thu', leads: 7,  quoteSent: 5, revenue: 155000 },
    { name: 'Fri', leads: 4,  quoteSent: 3, revenue: 91000  },
    { name: 'Sat', leads: 6,  quoteSent: 4, revenue: 210000 },
    { name: 'Sun', leads: 2,  quoteSent: 1, revenue: 28000  },
  ];

  // Monthly progression data — last 6 months
  const monthlyData = [
    { name: 'Jan', leads: 18, quoteSent: 12, revenue: 320000 },
    { name: 'Feb', leads: 24, quoteSent: 18, revenue: 510000 },
    { name: 'Mar', leads: 19, quoteSent: 14, revenue: 390000 },
    { name: 'Apr', leads: 31, quoteSent: 22, revenue: 740000 },
    { name: 'May', leads: 38, quoteSent: 28, revenue: 920000 },
    { name: 'Jun', leads: 29, quoteSent: 20, revenue: 639000 },
  ];

  const progressionData = chartView === 'weekly' ? weeklyData : monthlyData;

  // Derived conversion rate for current view
  const totalLeads   = progressionData.reduce((s, d) => s + d.leads, 0);
  const totalQuotes  = progressionData.reduce((s, d) => s + d.quoteSent, 0);
  const convRate     = totalLeads > 0 ? ((totalQuotes / totalLeads) * 100).toFixed(0) : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'Sent': return 'bg-blue-950/60 text-blue-400 border-blue-900/50';
      case 'Approved': case 'Signed': case 'Paid': return 'bg-emerald-950/60 text-emerald-400 border-emerald-900/50';
      case 'In Production': return 'bg-amber-950/60 text-amber-400 border-amber-900/50';
      case 'Revised': return 'bg-purple-950/60 text-purple-400 border-purple-900/50';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Command Center
            <Sparkles className="w-5 h-5 text-brand-pink animate-pulse" />
          </h2>
          <p className="text-slate-400 text-sm">
            Real-time visual monitoring of PixelWave Solutions client transaction lifecycles.
          </p>
        </div>
        <button 
          onClick={() => {
            setViewDocument(null);
            setActiveTab('editor');
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-pink hover:from-brand-blue/95 hover:to-brand-pink/95 text-white text-sm font-semibold shadow-lg shadow-brand-blue/10 flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <span>New AI Quote Ingest</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-brand-blue relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Revenue</p>
              <h3 className="text-2xl font-bold text-white mt-1.5">{stats.totalRevenue.toLocaleString()} LKR</h3>
            </div>
            <div className="p-2.5 bg-brand-blue/10 rounded-xl">
              <DollarSign className="w-5 h-5 text-brand-cyan" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24.5% from last month</span>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tr from-brand-blue/5 to-transparent rounded-full -mr-8 -mb-8 blur-md group-hover:scale-125 transition-transform duration-500"></div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-brand-pink relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved Quotes</p>
              <h3 className="text-2xl font-bold text-white mt-1.5">{stats.approvedQuotes} Documents</h3>
            </div>
            <div className="p-2.5 bg-brand-pink/10 rounded-xl">
              <FileText className="w-5 h-5 text-brand-pink" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400">
            <span>Ready for Proforma transition</span>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tr from-brand-pink/5 to-transparent rounded-full -mr-8 -mb-8 blur-md group-hover:scale-125 transition-transform duration-500"></div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-brand-cyan relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Signatures</p>
              <h3 className="text-2xl font-bold text-white mt-1.5">{stats.pendingSigns} Contracts</h3>
            </div>
            <div className="p-2.5 bg-brand-cyan/10 rounded-xl">
              <ClipboardList className="w-5 h-5 text-brand-cyan" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[10px] text-amber-400 font-medium">
            <span>Requires client E-sign</span>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tr from-brand-cyan/5 to-transparent rounded-full -mr-8 -mb-8 blur-md group-hover:scale-125 transition-transform duration-500"></div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-emerald-500 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Production</p>
              <h3 className="text-2xl font-bold text-white mt-1.5">{stats.activeOrders} Work Orders</h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[10px] text-emerald-400">
            <span>Active printing and design run</span>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full -mr-8 -mb-8 blur-md group-hover:scale-125 transition-transform duration-500"></div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Revenue Progression Area Chart */}
        <div className="glass-panel rounded-2xl p-5 md:col-span-2 space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h4 className="text-sm font-bold text-white tracking-wider uppercase">Lead to Revenue Conversion Timeline</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-400">Conversion rate:</span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">{convRate}%</span>
                <span className="text-[9px] text-slate-600">({totalQuotes}/{totalLeads} leads → quotes)</span>
              </div>
            </div>
            {/* Toggle */}
            <div className="flex bg-slate-950/50 p-1 border border-slate-800 rounded-xl no-print">
              {['weekly', 'monthly'].map(v => (
                <button
                  key={v}
                  onClick={() => setChartView(v)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    chartView === v
                      ? 'bg-gradient-to-r from-brand-blue to-brand-pink text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#009eff" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#009eff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fc0fc0" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#fc0fc0" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorQuotes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="rev" stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v/1000}k`} />
                <YAxis yAxisId="cnt" orientation="right" stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '11px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  formatter={(value, name) => {
                    if (name === 'revenue') return [`Rs.${value.toLocaleString()}`, 'Revenue'];
                    if (name === 'leads')   return [value, 'New Leads'];
                    if (name === 'quoteSent') return [value, 'Quotes Sent'];
                    return [value, name];
                  }}
                />
                <Area yAxisId="rev" type="monotone" dataKey="revenue"   stroke="#009eff" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area yAxisId="cnt" type="monotone" dataKey="leads"     stroke="#fc0fc0" strokeWidth={1.5} fillOpacity={1} fill="url(#colorLeads)" strokeDasharray="4 2" />
                <Area yAxisId="cnt" type="monotone" dataKey="quoteSent" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorQuotes)" strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 pt-1 border-t border-slate-850 flex-wrap">
            {[
              { color: '#009eff', label: 'Revenue (LKR)', dashed: false },
              { color: '#fc0fc0', label: 'New Leads',     dashed: true  },
              { color: '#10b981', label: 'Quotes Sent',   dashed: true  },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="h-0.5 w-6" style={{ backgroundColor: l.color, borderStyle: l.dashed ? 'dashed' : 'solid', borderColor: l.color, borderTopWidth: 2, background: 'none' }}></div>
                <span className="text-[9px] text-slate-400 font-semibold">{l.label}</span>
              </div>
            ))}
            <span className="ml-auto text-[9px] text-slate-600 font-mono">{chartView === 'weekly' ? 'This week · Mon–Sun' : 'This quarter · Jan–Jun'}</span>
          </div>
        </div>

        {/* Pipeline Value Bar Chart */}
        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white tracking-wider uppercase">Value in Pipeline (LKR)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  tickFormatter={(v) => `${v.toLocaleString()} LKR`}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => {
                    const colors = ['#009eff', '#0b54fe', '#fc0fc0', '#fbbf24', '#10b981'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lifecycle Document Repository */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h4 className="text-md font-bold text-white">Document Repository</h4>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search clients, quote no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-slate-950/40 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-blue transition-colors duration-300"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-950/50 p-1 border border-slate-800 rounded-xl">
              {['All', 'Quote', 'Agreement', 'Order', 'Invoice'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    filterType === t
                      ? 'bg-gradient-to-r from-brand-blue to-brand-pink text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'All' ? 'All Docs' : t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/60 bg-slate-950/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Doc / ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Value (LKR)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs text-slate-300">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-900/20 transition-all duration-200 group">
                    <td className="py-4 px-4 font-bold text-slate-200 group-hover:text-brand-cyan transition-colors">
                      {doc.quote_no}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-slate-200">{doc.customer_name}</div>
                        <div className="text-[10px] text-slate-500">{doc.customer_email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400">{doc.issue_date}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        doc.type === 'Quote' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/50' :
                        doc.type === 'Agreement' ? 'bg-purple-950/40 text-purple-400 border-purple-900/50' :
                        doc.type === 'Order' ? 'bg-amber-950/40 text-amber-400 border-amber-900/50' :
                        'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                      }`}>
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-200">
                      {doc.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* View & Edit Action */}
                        <button
                          onClick={() => {
                            setViewDocument(doc);
                            setActiveTab('editor');
                          }}
                          title="View / Edit in AI Builder"
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-brand-blue/20 text-slate-400 hover:text-brand-cyan transition-all border border-slate-700/60"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        
                        {/* Portal Preview Link */}
                        <button
                          onClick={() => {
                            setViewDocument(doc);
                            setActiveTab('portal');
                          }}
                          title="Simulate Client View"
                          className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-brand-pink/20 text-slate-400 hover:text-brand-pink transition-all border border-slate-700/60 text-[10px] font-bold flex items-center gap-1"
                        >
                          <span>Portal</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-medium">
                    No documents found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
