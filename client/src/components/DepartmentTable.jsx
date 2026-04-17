import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    Clock, MapPin, AlertCircle, CheckCircle2, 
    ArrowRight, Info, Target, Zap, Activity
} from 'lucide-react';

export default function DepartmentTable({ complaints, onSelectTicket }) {
    const departments = useMemo(() => {
        const uniqueDepts = [...new Set(complaints.map(c => c.department))];
        return uniqueDepts.map(name => {
            const list = complaints.filter(c => c.department === name);
            return {
                name,
                count: list.length,
                issues: list.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
            };
        }).sort((a, b) => b.count - a.count);
    }, [complaints]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'IN_PROGRESS': return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
            case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {departments.map((dept, dIdx) => (
                <motion.div 
                    key={dept.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dIdx * 0.1 }}
                    className="glass-card rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden h-[600px]"
                >
                    {/* Dept Header */}
                    <div className="p-8 border-b border-white/5 bg-slate-900/40 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">{dept.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Operations Monitoring Active</span>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400 text-[10px] font-black uppercase tracking-widest font-mono">
                            {dept.count} Issues
                        </div>
                    </div>

                    {/* Scrollable Issue List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {dept.issues.map((issue, iIdx) => (
                            <motion.div 
                                key={issue.ticket_id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: dIdx * 0.1 + iIdx * 0.05 }}
                                onClick={() => onSelectTicket(issue)}
                                className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 hover:bg-slate-800/40 hover:border-white/10 transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono group-hover:text-sky-400 transition-colors">
                                        {issue.ticket_id}
                                    </span>
                                    <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusColor(issue.status)}`}>
                                        {issue.status.replace('_', ' ')}
                                    </div>
                                </div>

                                <h4 className="text-lg font-black text-white italic tracking-tight mb-6 line-clamp-2">
                                    {issue.text}
                                </h4>

                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <MapPin size={10} className="text-sky-500" />
                                        {issue.area || 'Unknown'}
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                        (issue.priority_score > 7 || issue.priority === 'CRITICAL') 
                                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                                            : 'bg-white/5 text-slate-400 border-white/5'
                                    }`}>
                                        <Zap size={10} className={(issue.priority_score > 7 || issue.priority === 'CRITICAL') ? 'fill-current' : ''} />
                                        {issue.priority || 'Standard'}
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
                                        <Clock size={10} className="text-sky-500" />
                                        48 HOURS
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/50 border border-white/10 rounded-lg text-[9px] font-black text-sky-400 uppercase tracking-widest font-mono ml-auto">
                                        PTS: {issue.priority_score || 0}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer / Meta */}
                    <div className="p-4 bg-slate-950/50 border-t border-white/5 flex justify-between items-center px-8">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] font-mono italic">
                            Sector Alpha Grid Status: Nominal
                        </span>
                        <div className="flex gap-2">
                            {[1, 2, 3].map(dot => (
                                <div key={dot} className="w-1 h-1 rounded-full bg-slate-800" />
                            ))}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
