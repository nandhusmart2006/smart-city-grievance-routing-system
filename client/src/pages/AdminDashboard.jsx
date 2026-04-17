import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { RefreshCw, Filter, ShieldAlert, LayoutGrid, List, Clock } from 'lucide-react';
import KPICards from '../components/KPICards';
import LiveMap from '../components/LiveMap';
import GrievanceChart from '../components/GrievanceChart';
import CriticalQueueTable from '../components/CriticalQueueTable';
import AllComplaintsTable from '../components/AllComplaintsTable';
import TicketDetailModal from '../components/TicketDetailModal';

export default function AdminDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, criticalQueue: [] });
    const [filterDept, setFilterDept] = useState('All');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [view, setView] = useState('DASHBOARD'); // 'DASHBOARD' or 'LIST'
    const [loading, setLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const fetchComplaints = useCallback(async () => {
        setLoading(true);
        try {
            const [complaintsRes, statsRes] = await Promise.allSettled([
                axios.get('http://localhost:5000/complaints'),
                axios.get('http://localhost:5000/api/grievances/dashboard')
            ]);
            
            if (complaintsRes.status === 'fulfilled') {
                setComplaints(complaintsRes.value.data);
            } else {
                console.error('Complaints Fetch Failed:', complaintsRes.reason);
            }

            if (statsRes.status === 'fulfilled') {
                setStats(statsRes.value.data);
            } else {
                console.error('Dashboard Stats Fetch Failed:', statsRes.reason);
            }

            setLastUpdated(new Date());
        } catch (error) {
            console.error('Fatal HUD Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchComplaints();
        const intervalId = setInterval(fetchComplaints, 10000);
        return () => clearInterval(intervalId);
    }, [fetchComplaints]);

    const departments = ['All', ...new Set(complaints.map(c => c.department))];

    const filteredComplaints = filterDept === 'All' 
        ? complaints 
        : complaints.filter(c => c.department === filterDept);

    return (
        <div className="max-w-[1600px] mx-auto px-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 items-start">
                
                {/* Tactical Command Sidebar */}
                <aside className="lg:col-span-3 w-full space-y-8 sticky top-36">
                    {/* Ops Branding */}
                    <div className="glass-card p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3 relative z-10">
                            <ShieldAlert className="w-7 h-7 text-indigo-500" />
                            Ops Command
                        </h1>
                        <div className="mt-4 space-y-2 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Node Status: Nominal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-white/20" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Updated: {lastUpdated.toLocaleTimeString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* View Switcher */}
                    <div className="glass-card p-2 rounded-2xl border border-white/5 overflow-hidden flex flex-col gap-1">
                        {[
                            { id: 'DASHBOARD', label: 'Tactical Feed', icon: LayoutGrid },
                            { id: 'LIST', label: 'Grievance Archive', icon: List },
                            { id: 'DEPARTMENT', label: 'Department Overview', icon: ShieldAlert }
                        ].map((btn) => (
                            <button 
                                key={btn.id}
                                onClick={() => setView(btn.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                                    view === btn.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <btn.icon className="w-4 h-4" />
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    {/* Department Filter */}
                    <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Filter className="w-3.5 h-3.5 text-indigo-500" />
                            Sector Filter
                        </h2>
                        <div className="relative">
                            <select 
                                className="w-full bg-slate-950/50 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-4 outline-none appearance-none cursor-pointer focus:border-indigo-500 transition-all"
                                value={filterDept}
                                onChange={(e) => setFilterDept(e.target.value)}
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                <Filter className="w-3 h-3" />
                            </div>
                        </div>
                    </div>

                    {/* Resync Button */}
                    <button 
                        onClick={fetchComplaints}
                        className="w-full py-4 glass-card bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : 'group-hover:rotate-180 transition-transform'}`} />
                        Sync Data Feed
                    </button>
                </aside>

                {/* Main Content Area */}
                <main className="lg:col-span-9 w-full space-y-10">
                    {view === 'DASHBOARD' && (
                        <div className="space-y-10 animate-in fade-in duration-500">
                            <KPICards complaints={filteredComplaints} />

                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                                <div className="xl:col-span-7 flex flex-col space-y-4">
                                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                        Spatial Monitoring HUD
                                    </h2>
                                    <div className="flex-1 glass-card rounded-[2.5rem] border border-white/5 overflow-hidden min-h-[500px] shadow-2xl relative">
                                        <LiveMap complaints={filteredComplaints} />
                                        <div className="absolute top-6 right-6 z-20 pointer-events-none">
                                            <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[8px] font-black text-white/50 uppercase tracking-widest">
                                                Live Vector Stream
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="xl:col-span-5 flex flex-col space-y-4">
                                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                        Sector Logic Distribution
                                    </h2>
                                    <div className="flex-1 glass-card rounded-[2.5rem] border border-white/5 p-8 flex flex-col justify-center min-h-[500px] shadow-2xl">
                                        <GrievanceChart complaints={filteredComplaints} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-2">
                                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        Critical Incident Pipeline
                                        <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-[8px] border border-red-500/20">Action Required</span>
                                    </h2>
                                </div>
                                <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                                    <CriticalQueueTable complaints={stats.criticalQueue} onSelectTicket={setSelectedTicket} />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {view === 'LIST' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                            <div className="flex items-center justify-between px-2 bg-white/5 p-6 rounded-3xl border border-white/5">
                                 <div>
                                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                        Data Lake Records
                                    </h2>
                                    <p className="text-2xl font-black text-white uppercase italic tracking-tighter">Unified Grievance Archive</p>
                                 </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Total Nodes</span>
                                    <span className="text-3xl font-black text-white lining-nums">{filteredComplaints.length}</span>
                                </div>
                            </div>
                            <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                                <AllComplaintsTable complaints={filteredComplaints} onSelectTicket={setSelectedTicket} />
                            </div>
                        </div>
                    )}
                    
                    {view === 'DEPARTMENT' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                            <div className="flex items-center justify-between px-2 bg-white/5 p-6 rounded-3xl border border-white/5">
                                 <div>
                                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                                        Department Analytics
                                    </h2>
                                    <p className="text-2xl font-black text-white uppercase italic tracking-tighter">Department Wise Problems</p>
                                 </div>
                            </div>
                            
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {(() => {
                                    const grouped = filteredComplaints.reduce((acc, curr) => {
                                        const dept = curr.department || 'Uncategorized';
                                        if (!acc[dept]) acc[dept] = [];
                                        acc[dept].push(curr);
                                        return acc;
                                    }, {});
                                    
                                    return Object.keys(grouped).map(dept => (
                                        <div key={dept} className="glass-card rounded-[2rem] border border-white/5 p-6 hover:border-indigo-500/30 transition-all flex flex-col max-h-[500px]">
                                            <div className="flex justify-between items-start mb-6">
                                                <h4 className="text-sm font-black text-white uppercase tracking-widest">{dept}</h4>
                                                <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest">
                                                    {grouped[dept].length} Issues
                                                </span>
                                            </div>
                                            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                                {grouped[dept].map(issue => (
                                                    <div 
                                                        key={issue.ticket_id} 
                                                        onClick={() => setSelectedTicket(issue)}
                                                        className="bg-white/5 hover:bg-white/10 cursor-pointer border border-white/5 p-5 rounded-2xl transition-all"
                                                    >
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-[10px] text-slate-500 font-mono tracking-widest">{issue.ticket_id}</span>
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                                                issue.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                issue.status === 'IN_PROGRESS' ? 'bg-purple-500/20 text-purple-400' :
                                                                'bg-slate-500/20 text-slate-400'
                                                            }`}>
                                                                {issue.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-200">{issue.title}</p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-[9px] text-slate-500 uppercase tracking-wider bg-slate-950/50 px-2 py-1 rounded-md">{issue.area}</span>
                                                                <span className={`text-[9px] uppercase tracking-wider px-2 py-1 rounded-md font-bold ${
                                                                    issue.severity_label === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                                                    'bg-slate-950/50 text-slate-500'
                                                                }`}>{issue.severity_label || 'NORMAL'}</span>
                                                                <span className="text-[9px] text-slate-400 uppercase tracking-wider bg-white/5 border border-white/5 px-2 py-1 rounded-md flex items-center gap-1">
                                                                    <Clock size={10} className="text-amber-400" />
                                                                    <span className="text-[8px] font-black tracking-widest">{issue.estimated_resolution_time || '48 HOURS'}</span>
                                                                </span>
                                                            </div>
                                                            <div className="text-[10px] font-black tracking-widest text-slate-400">
                                                                PTS: <span className={issue.priority_score >= 8 ? 'text-red-400' : 'text-indigo-400'}>{issue.priority_score || 5}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {selectedTicket && (
                <TicketDetailModal 
                    ticket={selectedTicket} 
                    onClose={() => setSelectedTicket(null)} 
                    onRefresh={fetchComplaints}
                />
            )}
        </div>
    );
}
