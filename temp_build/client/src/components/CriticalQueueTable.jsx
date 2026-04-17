import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ChevronRight, Binary, Timer } from 'lucide-react';

export default function CriticalQueueTable({ complaints, onSelectTicket }) {
    const getSlaCountdown = (deadline) => {
        if (!deadline) return 'N/A';
        const diff = new Date(deadline) - new Date();
        if (diff <= 0) return 'EXPIRED';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${mins}m`;
    };

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-950/40 text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] font-mono border-b border-white/5">
                        <tr>
                            <th className="px-10 py-6">Incident Node</th>
                            <th className="px-10 py-6">Sector Branch</th>
                            <th className="px-10 py-6">SLA Countdown</th>
                            <th className="px-10 py-6 text-center">Threat Score</th>
                            <th className="px-10 py-6">Status</th>
                            <th className="px-10 py-6 text-right">Access</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {complaints.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-10 py-24 text-center text-slate-600 font-black uppercase tracking-[0.4em] bg-slate-900/10 italic">
                                    Queue Clear // No Active Threats
                                </td>
                            </tr>
                        ) : (
                            complaints.map((complaint, idx) => (
                                <motion.tr 
                                    key={complaint.ticket_id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group hover:bg-sky-500/[0.03] transition-colors relative cursor-default"
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1 h-6 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.4)]" />
                                            <span className="font-mono font-black text-slate-200 text-lg tracking-tighter uppercase">{complaint.ticket_id}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-950 border border-white/5 text-slate-400 group-hover:text-sky-400 group-hover:border-sky-500/20 transition-all">
                                            {complaint.department}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <Timer size={14} className="text-rose-500" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-rose-500/50 uppercase tracking-widest font-mono">Breach Flow</span>
                                                <span className="text-base font-black text-slate-200 font-mono italic">{getSlaCountdown(complaint.slaDeadline)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center text-rose-500">
                                        <div className="inline-flex flex-col items-center">
                                            <span className="text-2xl font-black italic tracking-tighter tabular-nums leading-none">{complaint.priority_score}</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-50 font-mono">VAL_PEAK</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse outline outline-4 outline-amber-500/10" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 italic font-mono">Imminent Breach</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button 
                                            onClick={() => onSelectTicket(complaint)}
                                            className="p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-sky-600 hover:border-sky-500 transition-all active:scale-90 group/btn"
                                        >
                                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
