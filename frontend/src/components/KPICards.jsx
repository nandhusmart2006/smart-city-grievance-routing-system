import React from 'react';
import { Ticket, CheckCircle, AlertOctagon, TrendingUp } from 'lucide-react';

export default function KPICards({ complaints }) {
    const totalOpen = complaints.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
    const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;
    const slaRiskCount = complaints.filter(c => c.sla_risk && c.status !== 'RESOLVED').length;

    const cards = [
        { 
            label: 'Open Requests', 
            count: totalOpen, 
            icon: Ticket, 
            color: 'text-indigo-400', 
            bg: 'bg-indigo-400/10', 
            border: 'border-indigo-400/20' 
        },
        { 
            label: 'Resolved Systems', 
            count: resolvedCount, 
            icon: CheckCircle, 
            color: 'text-emerald-400', 
            bg: 'bg-emerald-400/10', 
            border: 'border-emerald-400/20' 
        },
        { 
            label: 'SLA Breach Risks', 
            count: slaRiskCount, 
            icon: AlertOctagon, 
            color: 'text-rose-400', 
            bg: 'bg-rose-400/10', 
            border: 'border-rose-400/20' 
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, i) => (
                <div key={i} className={`glass-card p-6 rounded-3xl border ${card.border} group transition-all hover:translate-y-[-4px] cursor-default relative overflow-hidden flex flex-col justify-between min-h-[160px]`}>
                    <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{card.label}</p>
                            <p className="text-4xl font-black text-white tracking-tighter leading-none">{card.count}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center border border-white/5`}>
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                    </div>
                    
                    <div className="mt-6 space-y-3 relative z-10">
                        <div className="flex justify-between items-end">
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">System Load</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${card.color}`}>Active</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div 
                                className={`h-full ${card.bg.replace('10', '40')} rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(255,255,255,0.1)]`} 
                                style={{ width: `${Math.min(100, (card.count / 20) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Industrial background pattern */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rotate-45 translate-x-12 -translate-y-12 blur-2xl pointer-events-none" />
                </div>
            ))}
        </div>
    );
}
