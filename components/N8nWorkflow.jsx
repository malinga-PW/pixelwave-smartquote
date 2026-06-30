import React, { useState, useEffect } from 'react';
import { 
  Play, Cpu, Database, Mail, MessageSquare, 
  Terminal, Code, Settings, CheckCircle2, AlertCircle, ArrowRight
} from 'lucide-react';

export default function N8nWorkflow() {
  const [selectedNode, setSelectedNode] = useState('agent');
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [nodeStates, setNodeStates] = useState({
    trigger: 'idle',
    agent: 'idle',
    database: 'idle',
    channels: 'idle'
  });

  const nodes = {
    trigger: {
      title: 'Webhook Trigger',
      desc: 'Listens for incoming client Emails/WhatsApp briefs.',
      icon: Code,
      color: 'border-brand-blue shadow-brand-blue/10 text-brand-cyan',
      config: {
        path: '/webhooks/v1/client-inquiry',
        method: 'POST',
        headers: 'Content-Type: application/json',
        auth: 'None (Public webhook)'
      }
    },
    agent: {
      title: 'AI Agent Node',
      desc: 'LangChain Agent powered by Gemini / Claude.',
      icon: Cpu,
      color: 'border-brand-pink shadow-brand-pink/10 text-brand-pink',
      config: {
        model: 'Gemini 3.5 Flash (High)',
        temperature: '0.1',
        system_prompt: 'You are PixelWave\'s AI Billing Agent. Extract: customer name, email, phone, address, services, items, quantity. Execute pricing matrix tools and output clean JSON for quotation database sync.',
        tools: ['calculate_printing_price', 'packaging_cost_matrix', 'fetch_crm_contact']
      }
    },
    database: {
      title: 'Supabase DB Node',
      desc: 'Writes structured quotation & customer records.',
      icon: Database,
      color: 'border-emerald-500 shadow-emerald-500/10 text-emerald-400',
      config: {
        table: 'quotations',
        action: 'UPSERT',
        row_level_security: 'Active (RLS policies enabled)',
        fields_mapped: 'customer_id, quote_no, subtotal, grand_total, status'
      }
    },
    channels: {
      title: 'Notification Hub',
      desc: 'Dispatches WhatsApp & Email portal links.',
      icon: MessageSquare,
      color: 'border-brand-blue shadow-brand-blue/10 text-brand-blue',
      config: {
        whatsapp_api: 'Meta Cloud API v19.0',
        email_service: 'SendGrid Web API',
        templates: ['quote_approval_link', 'invoice_payment_copy'],
        tracking: 'Enabled (Clicks & Reads tracked)'
      }
    }
  };

  const steps = [
    { node: 'trigger', status: 'active', log: '📥 Webhook received raw message payload from WhatsApp/Email...', wait: 1200 },
    { node: 'trigger', status: 'success', log: '✅ Raw message parsed successfully. Forwarding to AI Agent Node.', wait: 1000 },
    { node: 'agent', status: 'active', log: '🧠 AI Agent Node starting thought process (Gemini 3.5)...', wait: 1400 },
    { node: 'agent', status: 'active', log: '🔍 [AI Agent] Thought: Raw client requests digital flyers & custom t-shirts. Invoking calculate_printing_price tool.', wait: 1500 },
    { node: 'agent', status: 'active', log: '⚙️ [AI Tool] Pricing calculated: T-Shirts (200 qty @ 900 LKR = 180,000 LKR). Surcharge added.', wait: 1200 },
    { node: 'agent', status: 'success', log: '✅ AI Agent output structured JSON matching Supabase schema.', wait: 1000 },
    { node: 'database', status: 'active', log: '💾 Supabase DB Node inserting record in "quotations" & "quotation_items"...', wait: 1200 },
    { node: 'database', status: 'success', log: '✅ Record inserted. Generated Quote ID: PW-2026-0043.', wait: 1000 },
    { node: 'channels', status: 'active', log: '✉️ Dispatching email notification & secure payment links to customer...', wait: 1500 },
    { node: 'channels', status: 'success', log: '🚀 WhatsApp and Email portal successfully deployed. Flow run completed.', wait: 800 }
  ];

  const runSimulation = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setActiveStep(0);
    setExecutionLogs([]);
    setNodeStates({
      trigger: 'idle',
      agent: 'idle',
      database: 'idle',
      channels: 'idle'
    });

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setActiveStep(i);
      setExecutionLogs(prev => [...prev, step.log]);
      
      // Update Node States
      setNodeStates(prev => {
        const next = { ...prev };
        next[step.node] = step.status;
        return next;
      });

      await new Promise(resolve => setTimeout(resolve, step.wait));
    }
    setIsExecuting(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            n8n AI Agent Workflow
          </h2>
          <p className="text-slate-400 text-[13px]">
            Configure and monitor your n8n Agent node that parses, writes, and issues documents automatically.
          </p>
        </div>
        <button
          onClick={runSimulation}
          disabled={isExecuting}
          className={`px-3 py-2 rounded-xl text-[12px] font-semibold flex items-center gap-2 transition-all duration-300 ${
            isExecuting 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
              : 'bg-gradient-to-r from-brand-blue to-brand-pink hover:from-brand-blue/95 hover:to-brand-pink/95 text-white shadow-lg shadow-brand-blue/10 transform hover:-translate-y-0.5'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>{isExecuting ? 'Workflow Running...' : 'Execute Test Flow'}</span>
        </button>
      </div>

      {/* Visual Workflow Canvas */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden bg-slate-950/20 border border-slate-800/80">
        {/* Connection Pulse Path (Background SVGs) */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Connection Line 1 */}
            <path d="M160,110 L280,110" stroke="#1e293b" strokeWidth="2" fill="none" />
            {isExecuting && activeStep >= 1 && (
              <path d="M160,110 L280,110" stroke="#009eff" strokeWidth="2.5" fill="none" className="animate-pulse-flow" />
            )}

            {/* Connection Line 2 */}
            <path d="M400,110 L520,110" stroke="#1e293b" strokeWidth="2" fill="none" />
            {isExecuting && activeStep >= 5 && (
              <path d="M400,110 L520,110" stroke="#fc0fc0" strokeWidth="2.5" fill="none" className="animate-pulse-flow" />
            )}

            {/* Connection Line 3 */}
            <path d="M640,110 L760,110" stroke="#1e293b" strokeWidth="2" fill="none" />
            {isExecuting && activeStep >= 8 && (
              <path d="M640,110 L760,110" stroke="#10b981" strokeWidth="2.5" fill="none" className="animate-pulse-flow" />
            )}
          </svg>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          {/* Node 1: Trigger */}
          <div 
            onClick={() => setSelectedNode('trigger')}
            className={`cursor-pointer rounded-xl p-3 border text-center transition-all duration-300 ${
              selectedNode === 'trigger' 
                ? 'bg-slate-900/90 border-brand-cyan shadow-lg shadow-brand-blue/5' 
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            } ${nodeStates.trigger === 'active' ? 'ring-2 ring-brand-cyan/50 animate-pulse' : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center mx-auto mb-3">
              <Code className={`w-4 h-4 ${nodeStates.trigger === 'success' ? 'text-emerald-400' : 'text-brand-cyan'}`} />
            </div>
            <h3 className="text-[12px] font-bold text-white uppercase tracking-wider">Webhook Trigger</h3>
            <p className="text-[10px] text-slate-500 mt-1">v2.23.4 Webhook Node</p>
            {nodeStates.trigger === 'success' && (
              <span className="text-[10px] mt-2 inline-block px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-900/40">Success</span>
            )}
          </div>

          {/* Node 2: AI Agent Node */}
          <div 
            onClick={() => setSelectedNode('agent')}
            className={`cursor-pointer rounded-xl p-3 border text-center transition-all duration-300 ${
              selectedNode === 'agent' 
                ? 'bg-slate-900/90 border-brand-pink shadow-lg shadow-brand-pink/5' 
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            } ${nodeStates.agent === 'active' ? 'ring-2 ring-brand-pink/50 animate-pulse' : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center mx-auto mb-3">
              <Cpu className={`w-4 h-4 ${nodeStates.agent === 'success' ? 'text-emerald-400' : 'text-brand-pink'}`} />
            </div>
            <h3 className="text-[12px] font-bold text-white uppercase tracking-wider">AI Agent Node</h3>
            <p className="text-[10px] text-slate-500 mt-1">Gemini / Claude Engine</p>
            {nodeStates.agent === 'success' && (
              <span className="text-[10px] mt-2 inline-block px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-900/40">Success</span>
            )}
          </div>

          {/* Node 3: Database Node */}
          <div 
            onClick={() => setSelectedNode('database')}
            className={`cursor-pointer rounded-xl p-3 border text-center transition-all duration-300 ${
              selectedNode === 'database' 
                ? 'bg-slate-900/90 border-emerald-500 shadow-lg shadow-emerald-500/5' 
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            } ${nodeStates.database === 'active' ? 'ring-2 ring-emerald-500/50 animate-pulse' : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center mx-auto mb-3">
              <Database className={`w-4 h-4 ${nodeStates.database === 'success' ? 'text-emerald-400' : 'text-emerald-400'}`} />
            </div>
            <h3 className="text-[12px] font-bold text-white uppercase tracking-wider">Supabase DB Node</h3>
            <p className="text-[10px] text-slate-500 mt-1">Sync State Node</p>
            {nodeStates.database === 'success' && (
              <span className="text-[10px] mt-2 inline-block px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-900/40">Success</span>
            )}
          </div>

          {/* Node 4: Channels */}
          <div 
            onClick={() => setSelectedNode('channels')}
            className={`cursor-pointer rounded-xl p-3 border text-center transition-all duration-300 ${
              selectedNode === 'channels' 
                ? 'bg-slate-900/90 border-brand-blue shadow-lg shadow-brand-blue/5' 
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            } ${nodeStates.channels === 'active' ? 'ring-2 ring-brand-blue/50 animate-pulse' : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className={`w-4 h-4 ${nodeStates.channels === 'success' ? 'text-emerald-400' : 'text-brand-blue'}`} />
            </div>
            <h3 className="text-[12px] font-bold text-white uppercase tracking-wider">Notification Hub</h3>
            <p className="text-[10px] text-slate-500 mt-1">WhatsApp & Email Link</p>
            {nodeStates.channels === 'success' && (
              <span className="text-[10px] mt-2 inline-block px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-900/40">Success</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Selected Node Properties & Execution Terminal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Node Properties Panel */}
        <div className="glass-panel rounded-2xl p-4 space-y-3 relative">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
            <h3 className="text-[12px] font-bold text-white tracking-wider uppercase flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Node Config: {nodes[selectedNode].title}</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-850 border border-slate-750 text-slate-400 font-mono">
              Active
            </span>
          </div>

          <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
            {nodes[selectedNode].desc}
          </p>

          <div className="space-y-2">
            {Object.entries(nodes[selectedNode].config).map(([key, val]) => (
              <div key={key} className="text-[12px] bg-slate-950/30 border border-slate-850 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-brand-cyan uppercase block tracking-wider mb-0.5">
                  {key.replace('_', ' ')}
                </span>
                {Array.isArray(val) ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {val.map((item, idx) => (
                      <span key={idx} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono text-[10px]">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-slate-200 mt-0.5 break-words text-[12px]">{val}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Execution Terminal */}
        <div className="glass-panel rounded-2xl p-4 bg-[#040811] border border-slate-900 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <h3 className="text-[12px] font-bold text-white tracking-wider uppercase flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-brand-pink" />
              <span>n8n Run Log Terminal</span>
            </h3>
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500/80"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500/80"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
            </div>
          </div>

          <div className="h-48 overflow-y-auto space-y-2 font-mono text-[12px] text-slate-300 pr-2">
            {executionLogs.length > 0 ? (
              executionLogs.map((log, idx) => (
                <div key={idx} className="fade-in">
                  <span className="text-slate-500 select-none mr-2">[{new Date().toLocaleTimeString()}]</span>
                  <span className={log.startsWith('✅') ? 'text-emerald-400' : log.startsWith('🧠') || log.startsWith('⚙️') ? 'text-brand-pink' : 'text-slate-300'}>
                    {log}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                <Terminal className="w-8 h-8 opacity-40 animate-pulse" />
                <p className="text-[11px]">Click "Execute Test Flow" to trigger the n8n simulation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
