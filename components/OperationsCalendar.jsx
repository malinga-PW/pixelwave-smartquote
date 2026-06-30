import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar, DollarSign, 
  Briefcase, CheckCircle2, Pin, Sparkles, Filter 
} from 'lucide-react';

export default function OperationsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 30)); // Seed: June 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-06-28');
  const [filterType, setFilterType] = useState('all');

  // Seed events database
  const events = [
    {
      id: 'e-1',
      date: '2026-06-02',
      title: 'Laser Journals Shipped',
      type: 'project',
      client: 'Lanka Crafted Gifts',
      detail: '100x bamboo custom journals completed, laser engraving test ran OK, shipped.'
    },
    {
      id: 'e-2',
      date: '2026-06-02',
      title: 'Lanka Crafted Invoice Paid',
      type: 'payment',
      client: 'Lanka Crafted Gifts',
      detail: '85,000 LKR invoice settled via secure portal checkout gateway.'
    },
    {
      id: 'e-3',
      date: '2026-06-05',
      title: 'T-Shirt Screens Prepped',
      type: 'project',
      client: 'Apex Merchandise',
      detail: 'Organic cotton screen-prep runs completed. Set to In Production.'
    },
    {
      id: 'e-4',
      date: '2026-06-10',
      title: 'n8n CRM SLA Contract Signed',
      type: 'agreement',
      client: 'TechStart Hub (Asia)',
      detail: 'Legal document executed digitally by client CEO Nipuni.'
    },
    {
      id: 'e-5',
      date: '2026-06-15',
      title: 'Green Field Box Design Prep',
      type: 'project',
      client: 'Green Field Tea Exporters',
      detail: 'Matte laminated double-wall packaging cardboard proofing vector prepped.'
    },
    {
      id: 'e-6',
      date: '2026-06-28',
      title: 'Topleaf Cinnamon Pouch Draft',
      type: 'project',
      client: 'Topleaf Plantations',
      detail: 'Raw client WhatsApp inquiry ingested. Initial pouch mockups under review.'
    },
    {
      id: 'e-7',
      date: '2026-07-02',
      title: 'Lanka Crafted Renewal Due',
      type: 'payment',
      client: 'Lanka Crafted Gifts',
      detail: 'Basic hosting plan retainer (5,000 LKR) subscription renewal.'
    },
    {
      id: 'e-8',
      date: '2026-07-10',
      title: 'TechStart SaaS Renewal Due',
      type: 'payment',
      client: 'TechStart Hub (Asia)',
      detail: 'n8n custom VPS integration care SLA payment (50,000 LKR) invoice due.'
    }
  ];

  // Helper calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const prevDays = Array.from({ length: firstDayIndex }, (_, i) => prevMonthDays - firstDayIndex + i + 1);
  const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const totalSlots = 42; // standard 6 rows grid
  const nextDays = Array.from({ length: totalSlots - (prevDays.length + currentDays.length) }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Parse ISO date helper
  const formatDateString = (dYear, dMonth, dDay) => {
    const mm = String(dMonth + 1).padStart(2, '0');
    const dd = String(dDay).padStart(2, '0');
    return `${dYear}-${mm}-${dd}`;
  };

  // Filter events
  const filteredEvents = events.filter(e => filterType === 'all' || e.type === filterType);

  // Selected date events
  const selectedEvents = events.filter(e => e.date === selectedDateStr);

  const getEventMarkerColor = (type) => {
    switch (type) {
      case 'project': return 'bg-brand-cyan';
      case 'payment': return 'bg-emerald-400';
      case 'agreement': return 'bg-brand-pink';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Operations Calendar
            <Sparkles className="w-5 h-5 text-brand-cyan" />
          </h2>
          <p className="text-slate-400 text-sm">
            Track milestones, retainers, and delivery dates across all active digital, print, and automation projects.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex bg-slate-950/50 p-1 border border-slate-800 rounded-xl items-center gap-1.5 no-print">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
          {[
            { id: 'all', label: 'All Events' },
            { id: 'project', label: 'Projects' },
            { id: 'payment', label: 'Payments' },
            { id: 'agreement', label: 'Agreements' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                filterType === f.id
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Monthly Calendar Grid (Span 8) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-6">
          {/* Calendar Controller Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-pink" />
              <span>{monthNames[month]} {year}</span>
            </h3>

            <div className="flex gap-2">
              <button 
                onClick={prevMonth} 
                className="p-2 rounded-xl bg-slate-950/40 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={nextMonth} 
                className="p-2 rounded-xl bg-slate-950/40 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="space-y-2">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-500 uppercase tracking-widest pb-2 border-b border-slate-850">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Monthly grid slots */}
            <div className="grid grid-cols-7 gap-2">
              {/* Previous Month trailing days */}
              {prevDays.map((day, idx) => (
                <div key={`prev-${idx}`} className="h-24 bg-slate-950/20 border border-slate-900/30 rounded-xl p-2 opacity-20 cursor-not-allowed select-none">
                  <span className="text-[10px] font-mono font-medium">{day}</span>
                </div>
              ))}

              {/* Current Month days */}
              {currentDays.map((day) => {
                const dateStr = formatDateString(year, month, day);
                const isSelected = dateStr === selectedDateStr;
                const dayEvents = filteredEvents.filter(e => e.date === dateStr);
                const isToday = day === 30 && month === 5 && year === 2026; // Static mock match current time

                return (
                  <div
                    key={`curr-${day}`}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`h-24 border rounded-xl p-2 cursor-pointer flex flex-col justify-between transition-all duration-300 relative group ${
                      isSelected
                        ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-brand-cyan shadow-md shadow-brand-blue/5'
                        : isToday
                          ? 'bg-slate-900/40 border-brand-pink'
                          : 'bg-slate-950/40 border-slate-850/80 hover:border-slate-700/80 hover:bg-slate-900/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-mono font-bold ${
                        isSelected ? 'text-brand-cyan' : isToday ? 'text-brand-pink' : 'text-slate-400'
                      }`}>
                        {day}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-ping"></span>
                      )}
                    </div>

                    {/* Event indicators stacked */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div 
                          key={ev.id} 
                          className="flex items-center gap-1 bg-slate-900/80 border border-slate-800/80 px-1.5 py-0.5 rounded truncate max-h-4"
                        >
                          <span className={`w-1 h-1 rounded-full ${getEventMarkerColor(ev.type)} shrink-0`}></span>
                          <span className="text-[8px] text-slate-300 truncate scale-95 origin-left font-medium">
                            {ev.title}
                          </span>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[7px] text-slate-500 font-bold block text-right px-1">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Next Month trailing days */}
              {nextDays.map((day, idx) => (
                <div key={`next-${idx}`} className="h-24 bg-slate-950/20 border border-slate-900/30 rounded-xl p-2 opacity-20 cursor-not-allowed select-none">
                  <span className="text-[10px] font-mono font-medium">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Selected Date Details Sidebar (Span 4) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-5 h-[calc(100vh-14rem)] sticky top-24 overflow-y-auto">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <Pin className="w-4 h-4 text-brand-pink" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Schedule for {new Date(selectedDateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
          </div>

          <div className="space-y-3.5">
            {selectedEvents.length > 0 ? (
              selectedEvents.map((ev) => (
                <div 
                  key={ev.id}
                  className={`border rounded-xl p-4 bg-slate-950/30 space-y-2 relative overflow-hidden group ${
                    ev.type === 'project' ? 'border-brand-blue/30' :
                    ev.type === 'payment' ? 'border-emerald-900/30' :
                    'border-brand-pink/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[8px] uppercase font-bold px-2 py-0.5 rounded border ${
                      ev.type === 'project' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/40' :
                      ev.type === 'payment' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' :
                      'bg-purple-950/40 text-purple-400 border-purple-900/40'
                    }`}>
                      {ev.type}
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold">{ev.client}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-brand-cyan transition-colors mt-1">
                    {ev.title}
                  </h4>
                  
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium pt-1">
                    {ev.detail}
                  </p>
                  
                  <div className="absolute right-0 bottom-0 w-16 h-16 bg-gradient-to-tr from-brand-blue/5 to-transparent rounded-full blur-sm"></div>
                </div>
              ))
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-650 text-center gap-2">
                <CheckCircle2 className="w-8 h-8 opacity-35 text-slate-550" />
                <p className="text-[10px] font-semibold text-slate-550">No operational events or payments scheduled for this date.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
