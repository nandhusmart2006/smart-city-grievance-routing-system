import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, MapPin, Database, Activity } from 'lucide-react';

export default function AllComplaintsTable({ complaints, onSelectTicket }) {
    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-950/40 text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] font-mono border-b border-white/5">
                        <tr>
                            <th className="px-10 py-6">Reference Node</th>
                            <th className="px-10 py-6">Incident Title</th>
                            <th className="px-10 py-6">Sector Branch</th>
                            <th className="px-10 py-6">Status Uplink</th>
                            <th className="px-10 py-6">Location</th>
                            <th className="px-10 py-6 text-right">Access</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {complaints.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-10 py-24 text-center text-slate-600 font-black uppercase tracking-[0.4em] bg-slate-900/10 italic">
                                    Archive Empty // No Data Streams
                                </td>
                            </tr>
                        ) : (
                            complaints.map((complaint, idx) => (
                                <motion.tr 
                                    key={complaint.ticket_id} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="group hover:bg-white/[0.02] transition-colors relative cursor-default"
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.4)]" />
                                            <span className="font-mono font-black text-white text-base tracking-tighter uppercase">{complaint.ticket_id}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="max-w-[250px] overflow-hidden text-ellipsis">
                                            <p className="font-bold text-slate-200 uppercase tracking-tight truncate">{complaint.title || 'Undefined Incident'}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate">{complaint.category}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                                            {complaint.department}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                complaint.status === 'RESOLVED' ? 'bg-emerald-500' : 
                                                complaint.status === 'IN_PROGRESS' ? 'bg-sky-500' : 'bg-slate-700'
                                            }`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                                                complaint.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                                complaint.status === 'IN_PROGRESS' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 
                                                'bg-slate-400/10 text-slate-400 border border-slate-500/20'
                                            }`}>
                                                {complaint.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <MapPin size={12} className="text-sky-500/50" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{complaint.area}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button 
                                            onClick={() => onSelectTicket(complaint)}
                                            className="p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-slate-800 transition-all active:scale-90 group/btn"
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
