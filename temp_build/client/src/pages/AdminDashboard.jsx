import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    RefreshCw, Filter, ShieldAlert, LayoutGrid, Shield,
    List, Clock, Activity, Target, Layers, ArrowUpRight 
} from 'lucide-react';
import KPICards from '../components/KPICards';
import LiveMap from '../components/LiveMap';
import GrievanceChart from '../components/GrievanceChart';
import CriticalQueueTable from '../components/CriticalQueueTable';
import AllComplaintsTable from '../components/AllComplaintsTable';
import DepartmentTable from '../components/DepartmentTable';
import TicketDetailModal from '../components/TicketDetailModal';

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            duration: 0.6, 
            staggerChildren: 0.1 
        }
    }
};

export default function AdminDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, criticalQueue: [] });
    const [filterDept, setFilterDept] = useState('All');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [view, setView] = useState('DASHBOARD');
    const [loading, setLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const fetchComplaints = useCallback(async () => {
        setLoading(true);
        try {
            const [complaintsRes, statsRes] = await Promise.allSettled([
                axios.get('http://localhost:5000/complaints'),
                axios.get('http://localhost:5000/api/grievances/dashboard')
            ]);
            
            if (complaintsRes.status === 'fulfilled') setComplaints(complaintsRes.value.data);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Data sync failed:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchComplaints();
        const intervalId = setInterval(fetchComplaints, 30000);
        return () => clearInterval(intervalId);
    }, [fetchComplaints]);

    const departments = ['All', ...new Set(complaints.map(c => c.department))];
    const filteredComplaints = filterDept === 'All' ? complaints : complaints.filter(c => c.department === filterDept);

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1700px] mx-auto px-6 py-8 pb-20"
        >
            {/* Header / Sub-Nav */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic flex items-center gap-3">
                        <Activity className="w-8 h-8 text-sky-400" />
                        SENTINEL <span className="text-sky-500/50">DATA HUB</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1 ml-1 flex items-center gap-2 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Infrastructure Monitoring Active
                    </p>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
                    <button 
                        onClick={() => setView('DASHBOARD')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            view === 'DASHBOARD' ? 'bg-sky-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <LayoutGrid size={14} /> Tactical Feed
                    </button>
                    <button 
                        onClick={() => setView('LIST')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            view === 'LIST' ? 'bg-sky-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <List size={14} /> Grievance Archive
                    </button>
                    <button 
                        onClick={() => setView('DEPARTMENTS')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            view === 'DEPARTMENTS' ? 'bg-sky-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Layers size={14} /> Department Overview
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 items-start">
                
                {/* Sidebar Controls */}
                <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-8">
                    
                    {/* Filter Card */}
                    <div className="glass-card p-6 rounded-[2rem] premium-border bg-slate-900/40">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2 font-mono">
                                <Shield size={14} className="text-sky-400" />
                                OPS COMMAND
                            </h2>
                            <RefreshCw 
                                onClick={fetchComplaints}
                                className={`w-4 h-4 cursor-pointer text-slate-500 hover:text-sky-400 transition-all ${loading ? 'animate-spin' : ''}`} 
                            />
                        </div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest font-mono">Node Status: Nominal</span>
                        </div>
                        
                        <div className="space-y-4">
                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 font-mono">Select Department Node</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-4 text-white text-[10px] font-bold uppercase tracking-widest outline-none focus:border-sky-500/50 transition-all appearance-none cursor-pointer"
                                    value={filterDept}
                                    onChange={(e) => setFilterDept(e.target.value)}
                                >
                                    {departments.map(d => <option key={d}>{d}</option>)}
                                </select>
                                <ArrowUpRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Stats Widget */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="glass-card p-6 rounded-[2rem] bg-gradient-to-br from-slate-900/60 to-sky-900/10 border border-sky-500/10 overflow-hidden relative group"
                    >
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <h3 className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1 font-mono">Queue Status</h3>
                                <p className="text-3xl font-black text-white italic tracking-tighter">{stats.criticalQueue.length}</p>
                            </div>
                            <Target size={30} className="text-sky-500/20 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-4 font-mono">Critical Vectors Detected</p>
                    </motion.div>

                    {/* Meta Info */}
                    <div className="flex justify-between px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest font-mono">
                        <span>Sync: Valid</span>
                        <span>{lastUpdated.toLocaleTimeString()}</span>
                    </div>
                </aside>

                {/* Main View Area */}
                <main className="col-span-12 lg:col-span-9">
                    <AnimatePresence mode="wait">
                        {view === 'DASHBOARD' ? (
                            <motion.div 
                                key="tactical"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <KPICards complaints={filteredComplaints} />

                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                                    <div className="xl:col-span-7 flex flex-col space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2 font-mono">
                                                <Layers size={14} className="text-sky-400" />
                                                Spatial Intelligence HUD
                                            </h2>
                                        </div>
                                        <div className="flex-1 glass-card rounded-[3rem] border border-white/5 overflow-hidden min-h-[500px] shadow-2xl relative shadow-sky-950/20">
                                            <LiveMap complaints={filteredComplaints} />
                                        </div>
                                    </div>
                                    
                                    <div className="xl:col-span-5 flex flex-col space-y-4">
                                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2 flex items-center gap-2 font-mono">
                                            <Activity size={14} className="text-sky-400" />
                                            Node Distribution
                                        </h2>
                                        <div className="flex-1 glass-card rounded-[3rem] border border-white/5 p-8 flex flex-col justify-center min-h-[500px]">
                                            <GrievanceChart complaints={filteredComplaints} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2 flex items-center gap-2 font-mono">
                                        <ShieldAlert size={14} className="text-rose-500" />
                                        Priority Incident Queue
                                    </h2>
                                    <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                                        <CriticalQueueTable complaints={stats.criticalQueue} onSelectTicket={setSelectedTicket} />
                                    </div>
                                </div>
                            </motion.div>
                        ) : view === 'LIST' ? (
                            <motion.div 
                                key="records"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="space-y-8"
                            >
                                <div className="glass-card p-10 rounded-[3rem] premium-border flex justify-between items-center bg-gradient-to-r from-slate-900/40 to-sky-950/20">
                                    <div>
                                        <h2 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.4em] mb-2 font-mono">Archive Access</h2>
                                        <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">Incident Records Registry</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Total Resolved</p>
                                        <p className="text-4xl font-black text-emerald-400 lining-nums italic">{complaints.filter(c => c.status === 'RESOLVED').length}</p>
                                    </div>
                                </div>
                                <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden">
                                    <AllComplaintsTable complaints={filteredComplaints} onSelectTicket={setSelectedTicket} />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="departments"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="space-y-8"
                            >
                                <div className="p-10 rounded-[3rem] border border-white/5 flex justify-between items-center bg-slate-900/40">
                                    <div>
                                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-2 font-mono">
                                            <span className="w-2 h-2 rounded-full bg-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
                                            Department Analytics
                                        </h2>
                                        <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Department Wise Problems</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Active Nodes</p>
                                        <p className="text-5xl font-black text-sky-400 lining-nums italic leading-none">{[...new Set(complaints.map(c => c.department))].length}</p>
                                    </div>
                                </div>
                                <div className="p-0">
                                    <DepartmentTable complaints={complaints} onSelectTicket={setSelectedTicket} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {selectedTicket && (
                <TicketDetailModal 
                    ticket={selectedTicket} 
                    onClose={() => setSelectedTicket(null)} 
                    onRefresh={fetchComplaints}
                />
            )}
        </motion.div>
    );
}
