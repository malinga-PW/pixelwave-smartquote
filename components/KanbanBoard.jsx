import React, { useState } from 'react';
import { Briefcase, ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function KanbanBoard() {
  // Columns Definition
  const columns = [
    { id: 'design', title: 'Pending Design', color: 'border-t-brand-blue' },
    { id: 'prep', title: 'Screen Prep / Setup', color: 'border-t-brand-pink' },
    { id: 'production', title: 'In Production', color: 'border-t-amber-500' },
    { id: 'qc', title: 'Quality Check', color: 'border-t-brand-cyan' },
    { id: 'complete', title: 'Delivery / Complete', color: 'border-t-emerald-500' }
  ];

  // Initial Work Orders seed state
  const [orders, setOrders] = useState([
    {
      id: 'PW-2026-0042-WO',
      client: 'Topleaf Plantations',
      title: 'Cinnamon Pouch Labels',
      desc: 'Eco-friendly pouch design mockup alignment.',
      status: 'design'
    },
    {
      id: 'PW-2026-0039-WO',
      client: 'Apex Merchandise',
      title: 'Custom Branded Tees',
      desc: '200x black organic cotton tees screen printing.',
      status: 'production'
    },
    {
      id: 'PW-2026-0038-WO',
      client: 'Lanka Crafted Gifts',
      title: 'Wooden Engraved Journals',
      desc: '100x fiber laser engraving runs on bamboo covers.',
      status: 'complete'
    },
    {
      id: 'PW-2026-0041-WO',
      client: 'Green Field Tea Exporters',
      title: 'Tea Packaging Boxes',
      desc: '500x double corrugated offset cardboard box fabrication.',
      status: 'prep'
    }
  ]);

  const moveOrder = (id, direction) => {
    const colIds = columns.map(c => c.id);
    setOrders(orders.map(order => {
      if (order.id === id) {
        const currIndex = colIds.indexOf(order.status);
        let nextIndex = currIndex + direction;
        
        if (nextIndex >= 0 && nextIndex < colIds.length) {
          const nextStatus = colIds[nextIndex];
          // Confetti on reaching Complete column!
          if (nextStatus === 'complete') {
            confetti({
              particleCount: 80,
              spread: 60,
              colors: ['#10b981', '#009eff']
            });
          }
          return { ...order, status: nextStatus };
        }
      }
      return order;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Work Order Production Board
        </h2>
        <p className="text-slate-400 text-sm">
          Track the physical design, setup, and printing workflows of your active work orders.
        </p>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colOrders = orders.filter(o => o.status === col.id);
          return (
            <div 
              key={col.id}
              className="bg-slate-950/20 border border-slate-900 rounded-2xl p-4 min-h-[500px] flex flex-col space-y-4"
            >
              {/* Column Title */}
              <div className={`border-t-4 ${col.color} pt-3 pb-2 border-b border-slate-900 flex justify-between items-center`}>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{col.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                  {colOrders.length}
                </span>
              </div>

              {/* Cards Slot */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[550px] pr-1">
                {colOrders.length > 0 ? (
                  colOrders.map((order) => (
                    <div 
                      key={order.id}
                      className={`glass-panel rounded-xl p-3.5 border border-slate-850 hover:border-slate-750 transition-all duration-300 relative group flex flex-col justify-between space-y-3 ${
                        order.status === 'complete' ? 'bg-emerald-950/5 border-emerald-950' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono text-slate-500 font-bold block">{order.id}</span>
                        <h4 className="text-xs font-bold text-slate-200 mt-1 leading-snug group-hover:text-brand-cyan transition-colors">
                          {order.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-normal font-medium mt-0.5">
                          {order.desc}
                        </p>
                      </div>

                      {/* Card Footer: Metadata and Shifters */}
                      <div className="border-t border-slate-900/60 pt-2.5 flex justify-between items-center text-[9px] text-slate-500 font-semibold no-print">
                        <span>{order.client}</span>
                        
                        <div className="flex gap-1">
                          {/* Shift Left */}
                          <button
                            onClick={() => moveOrder(order.id, -1)}
                            disabled={order.status === 'design'}
                            className={`p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors border border-slate-800`}
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          {/* Shift Right */}
                          <button
                            onClick={() => moveOrder(order.id, 1)}
                            disabled={order.status === 'complete'}
                            className={`p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors border border-slate-800`}
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-900/50 rounded-2xl text-slate-700 py-16">
                    <CheckCircle2 className="w-6 h-6 opacity-20 mb-1" />
                    <span className="text-[9px] font-medium">Empty Column</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
