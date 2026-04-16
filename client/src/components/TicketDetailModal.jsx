import React, { useState } from 'react';
import { X, Clock, MapPin, Tag, Shield, Cpu, Zap, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function TicketDetailModal({ ticket, onClose, onRefresh }) {
    const [updating, setUpdating] = useState(false);

    React.useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!ticket) return null;

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        try {
            await axios.patch(`http://localhost:5000/complaint/${ticket.ticket_id}`, { status: newStatus });
            onRefresh();
            onClose();
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const statuses = [
        { id: 'OPEN', label: 'Open', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        { id: 'IN_PROGRESS', label: 'Processing', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
        { id: 'RESOLVED', label: 'Resolved', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
    ];

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer"
            onClick={onClose}
        >
            <div 
                className="glass-card w-full max-w-2xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500 cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="bg-indigo-600 px-8 py-6 flex justify-between items-center relative z-30 shadow-lg">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-white/80" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Case Intelligence File</span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="relative z-50 p-4 -mr-4 hover:bg-white/10 rounded-full transition-all text-white/60 hover:text-white hover:rotate-90 active:scale-90 flex items-center justify-center min-w-[56px] min-h-[56px]"
                        aria-label="Close Modal"
                        title="Close (Esc)"
                    >
                        <X className="w-7 h-7" />
                    </button>
                </div>

                <div className="p-10 space-y-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {/* Ticket Identity */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div>
                            <div className="flex items-center gap-3 text-indigo-400 mb-2">
                                <Cpu className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Validated Node ID</span>
                            </div>
                            <h2 className="text-5xl font-mono font-black tracking-tighter text-white">{ticket.ticket_id}</h2>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-center min-w-[200px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">AI-SLA Alignment</p>
                            <p className={`text-xl font-black uppercase tracking-tighter ${ticket.sla_risk ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {ticket.sla_risk ? 'High Risk' : 'On Track'}
                            </p>
                        </div>
                    </div>

                    {/* Complaint Intelligence */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            Grievance Payload
                        </h3>
                        <div className="p-8 bg-slate-950/50 rounded-3xl border border-white/5 relative group">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest">{ticket.title || 'Untitled Grievance'}</h4>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${ticket.is_anonymous ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {ticket.is_anonymous ? 'Anonymous' : 'Verified ID'}
                                </span>
                            </div>
                            <p className="text-lg text-slate-300 indent-8 leading-relaxed italic mb-6">
                                "{ticket.text}"
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Tag className="w-3 h-3 text-indigo-400" />
                                    {ticket.category || 'Uncategorized'}
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-indigo-400" />
                                    SLA: {ticket.estimated_resolution_time}
                                </span>
                                <span className={`px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${ticket.isSlaBreachWarning ? 'text-rose-400 border-rose-500/20' : 'text-emerald-400'}`}>
                                    <Zap className="w-3 h-3" />
                                    Deadline: {new Date(ticket.slaDeadline).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Neural Interpretation */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Cpu className="w-4 h-4" />
                                Neural Interpretation (AI Triage Note)
                            </h3>
                            <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 italic text-slate-400 text-sm leading-relaxed">
                                "{ticket.normalized_text || 'AI Triage processing complete.'}"
                            </div>
                        </div>
                    </div>

                    {/* Citizen & Location Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Shield className="w-4 h-4 text-indigo-500" />
                                Citizen Profile
                            </h3>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                <div>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Primary Contact</p>
                                    <p className="text-sm font-bold text-slate-200">{ticket.citizen_name || 'Anonymous'}</p>
                                    <p className="text-[10px] font-mono text-slate-500">{ticket.citizen_phone || 'Blocked'}</p>
                                </div>
                                <div className="pt-3 border-t border-white/5">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Residential Vector</p>
                                    <p className="text-[10px] text-slate-400 leading-relaxed uppercase">{ticket.citizen_address || 'Not Provided'}</p>
                                    <p className="text-[10px] font-mono text-indigo-400 mt-1">{ticket.citizen_pincode}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-indigo-500" />
                                Incident Vector
                            </h3>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                <div>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Municipal Node</p>
                                    <p className="text-sm font-bold text-indigo-400 uppercase tracking-tighter">{ticket.area || 'Unknown Area'}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest underline decoration-indigo-500/30">{ticket.locality}</p>
                                </div>
                                <div className="pt-3 border-t border-white/5">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Specific Location</p>
                                    <p className="text-[10px] text-slate-400 leading-relaxed italic break-words">"{ticket.specific_location || 'Refer to text'}"</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Classification Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-indigo-500" />
                                System Routing
                            </h3>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Assigned Department</p>
                                <p className="text-lg font-black text-indigo-400 uppercase tracking-tighter leading-tight">{ticket.department}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-indigo-500" />
                                Priority Tier
                            </h3>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Severity Assessment</p>
                                <p className="text-lg font-black text-indigo-400 uppercase tracking-tighter leading-tight">{ticket.severity_label}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Update Control */}
                    <div className="pt-6 border-t border-white/5">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6 block text-center">Lifecycle Modification</h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                            {statuses.map((status) => (
                                <button
                                    key={status.id}
                                    disabled={updating}
                                    onClick={() => handleStatusUpdate(status.id)}
                                    className={`flex-1 flex flex-col items-center gap-1 p-4 rounded-2xl border transition-all ${
                                        ticket.status === status.id 
                                        ? `${status.bg} ${status.border} scale-105 shadow-xl` 
                                        : 'bg-transparent border-white/5 hover:bg-white/5'
                                    } disabled:opacity-50`}
                                >
                                    <span className={`text-xs font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                                    {ticket.status === status.id && (
                                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] italic">Current State</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {updating && (
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                            <p className="text-xs font-black text-white uppercase tracking-[0.3em]">Synching Neural Data...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
