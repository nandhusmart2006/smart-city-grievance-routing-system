import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Tag, Shield, Cpu, Zap, CheckCircle, Loader2, Binary, Activity } from 'lucide-react';
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
        { id: 'OPEN', label: 'Triage', color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
        { id: 'IN_PROGRESS', label: 'Active Op', color: 'text-sky-400', bg: 'bg-sky-500/5', border: 'border-sky-500/20' },
        { id: 'RESOLVED', label: 'Resolved', color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-card w-full max-w-3xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="bg-slate-900/60 border-b border-white/5 px-10 py-8 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
                            <Binary size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 font-mono">Incident Metadata</span>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{ticket.ticket_id}</h2>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-3 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 transition-all text-slate-400 hover:text-white group"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                <div className="p-10 space-y-12 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {/* Top Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/5 flex flex-col justify-center">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1">Threat Index</span>
                            <span className={`text-2xl font-black italic tracking-widest ${ticket.priority_score >= 8 ? 'text-rose-500' : 'text-sky-400'}`}>
                                {ticket.priority_score}/10
                            </span>
                        </div>
                        <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/5 flex flex-col justify-center">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1">SLA Alignment</span>
                            <span className={`text-2xl font-black italic tracking-widest ${ticket.sla_risk ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {ticket.sla_risk ? 'Breached' : 'Valid'}
                            </span>
                        </div>
                        <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/5 flex flex-col justify-center">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1">Lifecycle</span>
                            <span className="text-2xl font-black italic tracking-widest text-white uppercase">{ticket.status}</span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Zap size={14} className="text-sky-400" />
                                {ticket.title || 'Untitled Grievance Payload'}
                            </h3>
                            <div className="p-8 bg-slate-950/60 rounded-[2rem] border border-white/5 relative group">
                                <p className="text-lg text-slate-300 leading-relaxed italic">
                                    "{ticket.text}"
                                </p>
                                <div className="mt-8 flex flex-wrap gap-4">
                                    <span className="px-4 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Tag size={12} className="text-sky-400" />
                                        {ticket.department}
                                    </span>
                                    <span className="px-4 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin size={12} className="text-sky-400" />
                                        {ticket.area}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-sky-500/5 rounded-[1.5rem] border border-sky-500/10 italic text-slate-400 text-sm leading-relaxed flex items-start gap-4">
                            <Cpu size={18} className="text-sky-400 flex-shrink-0 mt-1" />
                            <p>"{ticket.normalized_text || 'AI Triage processing complete. Signal stabilized.'}"</p>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono ml-2">Origin Vector</h3>
                            <div className="p-6 bg-white/5 rounded-[1.5rem] border border-white/5 space-y-4">
                                <div>
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest font-mono">Location Data</p>
                                    <p className="text-[11px] font-bold text-slate-300 uppercase leading-snug">{ticket.specific_location || 'Refer to triage text'}</p>
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest font-mono">Residential Pin</p>
                                    <p className="text-[11px] font-bold text-sky-400 font-mono italic">{ticket.citizen_pincode || '600000'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono ml-2">Lifecycle Management</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {statuses.map((status) => (
                                    <button
                                        key={status.id}
                                        disabled={updating}
                                        onClick={() => handleStatusUpdate(status.id)}
                                        className={`flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${
                                            ticket.status === status.id 
                                            ? `${status.bg} ${status.border} shadow-[0_0_20px_rgba(56,189,248,0.1)]` 
                                            : 'bg-transparent border-white/5 hover:bg-white/5 text-slate-500'
                                        } disabled:opacity-50 group hover:scale-[1.02] active:scale-[0.98]`}
                                    >
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] font-mono ${ticket.status === status.id ? status.color : ''}`}>
                                            {status.label}
                                        </span >
                                        {ticket.status === status.id ? (
                                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                                        ) : (
                                            <Activity size={12} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {updating && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[60]"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
                                <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] font-mono">Synchronizing Data Node...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
