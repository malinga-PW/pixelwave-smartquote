import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar, DollarSign, 
  Briefcase, CheckCircle2, Pin, Sparkles, Filter,
  Plus, Trash2, TrendingUp, Share2, Eye, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OperationsCalendar() {
  const [viewMode, setViewMode] = useState('weekly'); // 'monthly' or 'weekly'
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 30)); // June 30, 2026 (Tuesday)
  const [selectedDateStr, setSelectedDateStr] = useState('2026-06-30');
  
  // Weekly Planner States
  const [weeklyTasks, setWeeklyTasks] = useState([
    { id: 'w-1', day: 'Mon', category: 'social', title: 'Share Cinnamon Pouch Mockup', time: '09:00 AM', detail: 'Post Golden foil dark pouch mockup on Instagram & Facebook page.', done: true },
    { id: 'w-2', day: 'Mon', category: 'ops', title: 'Topleaf Client Sync', time: '11:30 AM', detail: 'Sync with Dilhan regarding pouch structural proof revisions.', done: true },
    { id: 'w-3', day: 'Tue', category: 'analytics', title: 'Check Website traffic stats', time: '10:00 AM', detail: 'Review monthly analytics and pixel data from smartquote domains.', done: true },
    { id: 'w-4', day: 'Tue', category: 'ops', title: 'n8n Webhook connection prep', time: '02:00 PM', detail: 'Deploy test webhook endpoint for TechStart CRM automation lead flow.', done: false },
    { id: 'w-5', day: 'Wed', category: 'social', title: 'Write automation case-study', time: '04:00 PM', detail: 'Draft LinkedIn article showing how n8n AI agent reduced quote times by 80%.', done: false },
    { id: 'w-6', day: 'Wed', category: 'ops', title: 'Laser engrave wood runs', time: '11:00 AM', detail: 'Fiber laser engrave corporate logos on bamboo wooden journal covers.', done: false },
    { id: 'w-7', day: 'Thu', category: 'ops', title: 'Settle Green Field PI', time: '09:30 AM', detail: 'Verify Proforma Invoice wire receipt for cardboard packaging run.', done: false },
    { id: 'w-8', day: 'Fri', category: 'analytics', title: 'Week Revenue & win-rate audit', time: '03:00 PM', detail: 'Review closed quotations stats in SaaS dashboard.', done: false },
    { id: 'w-9', day: 'Fri', category: 'social', title: 'WhatsApp blast: Printing Surcharges', time: '10:00 AM', detail: 'Send digital flyer offer to 50 active print retail clients.', done: false },
  ]);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskDay, setTaskDay] = useState('Mon');
  const [taskCategory, setTaskCategory] = useState('ops');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDetail, setTaskDetail] = useState('');

  // Add Task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskTitle) return;

    const newTask = {
      id: `w-${Date.now()}`,
      day: taskDay,
      category: taskCategory,
      title: taskTitle,
      time: '12:00 PM',
      detail: taskDetail,
      done: false
    };

    setWeeklyTasks([...weeklyTasks, newTask]);
    setShowAddTaskModal(false);
    
    // Clear
    setTaskTitle('');
    setTaskDetail('');

    confetti({
      particleCount: 50,
      spread: 30,
      colors: ['#fc0fc0', '#0b54fe']
    });
  };

  const handleToggleTaskDone = (id) => {
    setWeeklyTasks(weeklyTasks.map(t => {
      if (t.id === id) {
        const nextDone = !t.done;
        if (nextDone) {
          confetti({
            particleCount: 30,
            gravity: 0.8,
            spread: 40,
            origin: { y: 0.8 }
          });
        }
        return { ...t, done: nextDone };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id) => {
    setWeeklyTasks(weeklyTasks.filter(t => t.id !== id));
  };

  // Monthly Calendar Seed Events
  const monthlyEvents = [
    { id: 'e-1', date: '2026-06-02', title: 'Laser Journals Shipped', type: 'project', client: 'Lanka Crafted Gifts' },
    { id: 'e-2', date: '2026-06-02', title: 'Lanka Crafted Invoice Paid', type: 'payment', client: 'Lanka Crafted Gifts' },
    { id: 'e-3', date: '2026-06-05', title: 'T-Shirt Screens Prepped', type: 'project', client: 'Apex Merchandise' },
    { id: 'e-4', date: '2026-06-10', title: 'n8n CRM SLA Signed', type: 'agreement', client: 'TechStart Hub (Asia)' },
    { id: 'e-5', date: '2026-06-15', title: 'Green Field Box Design Prep', type: 'project', client: 'Green Field Tea' },
    { id: 'e-6', date: '2026-06-28', title: 'Topleaf Cinnamon Pouch Draft', type: 'project', client: 'Topleaf Plantations' }
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
  const totalSlots = 42; 
  const nextDays = Array.from({ length: totalSlots - (prevDays.length + currentDays.length) }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatDateString = (dYear, dMonth, dDay) => {
    const mm = String(dMonth + 1).padStart(2, '0');
    const dd = String(dDay).padStart(2, '0');
    return `${dYear}-${mm}-${dd}`;
  };

  const getEventMarkerColor = (type) => {
    switch (type) {
      case 'project': return 'bg-brand-cyan';
      case 'payment': return 'bg-emerald-400';
      case 'agreement': return 'bg-brand-pink';
      default: return 'bg-slate-400';
    }
  };

  // Weekly calculations
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const weeklyStats = React.useMemo(() => {
    const total = weeklyTasks.length;
    const completed = weeklyTasks.filter(t => t.done).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const socialPrepped = weeklyTasks.filter(t => t.category === 'social').length;
    const socialCompleted = weeklyTasks.filter(t => t.category === 'social' && t.done).length;

    return {
      total,
      completed,
      rate,
      socialPrepped,
      socialCompleted
    };
  }, [weeklyTasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Operations & Planning
            <Sparkles className="w-5 h-5 text-brand-pink animate-pulse" />
          </h2>
          <p className="text-slate-400 text-sm">
            Plan your business operations, review conversion analytics, and schedule your social media posts weekly.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex bg-slate-950/50 p-1 border border-slate-800 rounded-xl items-center no-print">
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
              viewMode === 'weekly'
                ? 'bg-gradient-to-r from-brand-blue to-brand-pink text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Weekly Planner
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
              viewMode === 'monthly'
                ? 'bg-gradient-to-r from-brand-blue to-brand-pink text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Calendar
          </button>
        </div>
      </div>

      {/* WEEKLY PLANNER MODE */}
      {viewMode === 'weekly' && (
        <div className="space-y-6">
          {/* Weekly Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-brand-blue">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Weekly Task Completion</p>
              <div className="flex items-center justify-between mt-2">
                <h3 className="text-2xl font-bold text-white">{weeklyStats.rate}%</h3>
                <span className="text-xs text-slate-500 font-mono">({weeklyStats.completed}/{weeklyStats.total})</span>
              </div>
              <div className="w-full bg-slate-950/40 rounded-full h-1.5 mt-3 overflow-hidden border border-slate-900">
                <div 
                  className="bg-gradient-to-r from-brand-blue to-brand-cyan h-full transition-all duration-500" 
                  style={{ width: `${weeklyStats.rate}%` }}
                ></div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-brand-pink">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Social Media Posts Prepped</p>
              <div className="flex items-center justify-between mt-2">
                <h3 className="text-2xl font-bold text-white">
                  {weeklyStats.socialCompleted} <span className="text-xs text-slate-500 font-normal">/ {weeklyStats.socialPrepped} prepped</span>
                </h3>
                <Share2 className="w-5 h-5 text-brand-pink" />
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-emerald-500">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Target Retainer Income</p>
              <div className="flex items-center justify-between mt-2">
                <h3 className="text-2xl font-bold text-white">100,000 LKR</h3>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-brand-cyan">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Operations Focus</p>
              <div className="flex items-center justify-between mt-2">
                <h3 className="text-sm font-bold text-brand-cyan">n8n Lead Syncing</h3>
                <Award className="w-5 h-5 text-brand-cyan" />
              </div>
            </div>
          </div>

          {/* Quick Task Add Button */}
          <div className="flex justify-end no-print">
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-750 text-brand-cyan text-xs font-bold flex items-center gap-1.5 transition-all shadow-inner"
            >
              <Plus className="w-4 h-4" />
              <span>Add Weekly Task</span>
            </button>
          </div>

          {/* Weekly Board Columns */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekdays.map((day) => {
              const dayTasks = weeklyTasks.filter(t => t.day === day);
              return (
                <div key={day} className="glass-panel rounded-2xl p-4 border border-slate-850/80 bg-slate-950/10 flex flex-col min-h-[400px] space-y-4">
                  {/* Day Header */}
                  <div className="border-b border-slate-850 pb-2 flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase tracking-widest">{day}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-850 text-slate-400 font-mono">
                      {dayTasks.length}
                    </span>
                  </div>

                  {/* Tasks Slot */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                    {dayTasks.length > 0 ? (
                      dayTasks.map((task) => (
                        <div 
                          key={task.id}
                          className={`p-3 rounded-xl border transition-all duration-300 relative group flex flex-col justify-between space-y-2.5 ${
                            task.done 
                              ? 'bg-slate-900/20 border-slate-850 opacity-50 line-through' 
                              : task.category === 'ops'
                                ? 'bg-indigo-950/20 border-brand-blue/30'
                                : task.category === 'analytics'
                                  ? 'bg-emerald-950/20 border-emerald-900/30'
                                  : 'bg-purple-950/20 border-brand-pink/30'
                          }`}
                        >
                          <div className="space-y-1">
                            {/* Category Badge */}
                            <div className="flex justify-between items-center">
                              <span className={`text-[8px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                                task.category === 'ops' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30' :
                                task.category === 'analytics' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' :
                                'bg-purple-950/40 text-purple-400 border-purple-900/30'
                              }`}>
                                {task.category}
                              </span>
                              <span className="text-[7px] text-slate-500 font-mono">{task.time}</span>
                            </div>

                            <h4 className="text-[11px] font-bold text-slate-200 mt-1 leading-tight">
                              {task.title}
                            </h4>
                            <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
                              {task.detail}
                            </p>
                          </div>

                          {/* Action icons */}
                          <div className="flex justify-between items-center border-t border-slate-850/40 pt-2 no-print">
                            <button
                              onClick={() => handleToggleTaskDone(task.id)}
                              className={`text-[8px] font-bold px-2 py-0.5 rounded transition-all ${
                                task.done 
                                  ? 'bg-slate-800 text-slate-400' 
                                  : 'bg-slate-900 hover:bg-emerald-500/20 text-brand-cyan border border-slate-800 hover:border-emerald-500/30'
                              }`}
                            >
                              {task.done ? 'Reopen' : 'Complete'}
                            </button>

                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-[9px] text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-28 flex flex-col items-center justify-center border border-dashed border-slate-900 rounded-xl text-slate-700">
                        <span className="text-[8px] font-bold">No tasks</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MONTHLY CALENDAR MODE (Fallbacks/Original) */}
      {viewMode === 'monthly' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Monthly grid */}
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-pink" />
                <span>{monthNames[month]} {year}</span>
              </h3>

              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 rounded-xl bg-slate-950/40 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-100 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={nextMonth} className="p-2 rounded-xl bg-slate-950/40 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-100 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-500 uppercase tracking-widest pb-2 border-b border-slate-850">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {prevDays.map((day, idx) => (
                  <div key={`prev-${idx}`} className="h-24 bg-slate-950/20 border border-slate-900/30 rounded-xl p-2 opacity-20 cursor-not-allowed select-none">
                    <span className="text-[10px] font-mono">{day}</span>
                  </div>
                ))}

                {currentDays.map((day) => {
                  const dateStr = formatDateString(year, month, day);
                  const isSelected = dateStr === selectedDateStr;
                  const dayEvents = monthlyEvents.filter(e => e.date === dateStr);
                  const isToday = day === 30 && month === 5 && year === 2026;

                  return (
                    <div
                      key={`curr-${day}`}
                      onClick={() => setSelectedDateStr(dateStr)}
                      className={`h-24 border rounded-xl p-2 cursor-pointer flex flex-col justify-between transition-all duration-300 relative ${
                        isSelected
                          ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-brand-cyan shadow-md'
                          : isToday
                            ? 'bg-slate-900/40 border-brand-pink'
                            : 'bg-slate-950/40 border-slate-850 hover:border-slate-750'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-brand-cyan' : isToday ? 'text-brand-pink' : 'text-slate-400'}`}>
                          {day}
                        </span>
                      </div>

                      <div className="space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div key={ev.id} className="flex items-center gap-1 bg-slate-900/80 border border-slate-800/80 px-1.5 py-0.5 rounded truncate max-h-4">
                            <span className={`w-1 h-1 rounded-full ${getEventMarkerColor(ev.type)} shrink-0`}></span>
                            <span className="text-[8px] text-slate-300 truncate scale-95 origin-left font-medium">{ev.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {nextDays.map((day, idx) => (
                  <div key={`next-${idx}`} className="h-24 bg-slate-950/20 border border-slate-900/30 rounded-xl p-2 opacity-20 cursor-not-allowed select-none">
                    <span className="text-[10px] font-mono">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar selected day inspector */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-5 h-[calc(100vh-14rem)] sticky top-24 overflow-y-auto">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Pin className="w-4 h-4 text-brand-pink" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Schedule for {new Date(selectedDateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </h3>
            </div>

            <div className="space-y-3">
              {monthlyEvents.filter(e => e.date === selectedDateStr).length > 0 ? (
                monthlyEvents.filter(e => e.date === selectedDateStr).map((ev) => (
                  <div key={ev.id} className="border border-brand-blue/30 rounded-xl p-4 bg-slate-950/30 space-y-2">
                    <span className="text-[8px] uppercase font-bold px-2 py-0.5 rounded border bg-indigo-950/40 text-indigo-400 border-indigo-900/40">{ev.type}</span>
                    <h4 className="text-xs font-bold text-slate-100">{ev.title}</h4>
                    <p className="text-[10px] text-slate-400">{ev.client}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-10">No events scheduled.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4">
            <button 
              onClick={() => setShowAddTaskModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
            >
              <Trash2 className="w-4 h-4 transform rotate-45" />
            </button>
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calendar className="w-5 h-5 text-brand-cyan" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add Weekly Planner Task</h3>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Weekday</label>
                  <select
                    value={taskDay}
                    onChange={(e) => setTaskDay(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                  >
                    {weekdays.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                  >
                    <option value="ops">💼 Operations</option>
                    <option value="analytics">📈 Analytics Check</option>
                    <option value="social">📱 Social Media</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Share pouch mockups on FB"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Description Details</label>
                <textarea
                  rows="3"
                  placeholder="Detail notes..."
                  value={taskDetail}
                  onChange={(e) => setTaskDetail(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-pink hover:from-brand-blue/95 hover:to-brand-pink/95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/10 transition-all"
              >
                <span>Add to Weekly Board</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
