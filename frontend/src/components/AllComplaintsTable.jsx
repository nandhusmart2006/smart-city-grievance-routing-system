import React from 'react';
import { ChevronRight, Clock, MapPin, Tag } from 'lucide-react';

export default function AllComplaintsTable({ complaints, onSelectTicket }) {
    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-900/50 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                        <tr>
                            <th className="px-8 py-5">Ticket ID</th>
                            <th className="px-8 py-5">Department / Node</th>
                            <th className="px-8 py-5">Issue Description</th>
                            <th className="px-8 py-5 text-center">Status</th>
                            <th className="px-8 py-5">Priority</th>
                            <th className="px-8 py-5 text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {complaints.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-8 py-16 text-center text-slate-600 font-bold uppercase tracking-widest bg-slate-900/10">
                                    No records found in database.
                                </td>
                            </tr>
                        ) : (
                            complaints.map(complaint => (
                                <tr key={complaint.ticket_id} className="group hover:bg-white/[0.02] transition-colors relative overflow-hidden">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1.5 h-6 rounded-full ${
                                                complaint.status === 'RESOLVED' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 
                                                complaint.status === 'IN_PROGRESS' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]' :
                                                'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                            }`} />
                                            <span className="font-mono font-black text-slate-200 text-base">{complaint.ticket_id}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                                                {complaint.department}
                                            </span>
                                            {complaint.location && (
                                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                                    <MapPin className="w-3 h-3" />
                                                    Station Node {complaint.location.split(',')[0].substring(0, 5)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 max-w-sm truncate text-slate-400 font-medium italic opacity-70 group-hover:opacity-100 transition-opacity">
                                        "{complaint.normalized_text}"
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                                            complaint.status === 'RESOLVED' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' :
                                            complaint.status === 'IN_PROGRESS' ? 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5' :
                                            'border-amber-500/20 text-amber-400 bg-amber-500/5'
                                        }`}>
                                            {complaint.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 w-12 bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${
                                                        complaint.priority_score >= 8 ? 'bg-rose-500' : 
                                                        complaint.priority_score >= 5 ? 'bg-amber-500' : 
                                                        'bg-emerald-500'
                                                    }`} 
                                                    style={{ width: `${complaint.priority_score * 10}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500">{complaint.priority_score}/10</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                            onClick={() => onSelectTicket(complaint)}
                                            className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all active:scale-95 group/btn shadow-lg"
                                        >
                                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
