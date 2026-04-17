import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, CheckCircle, AlertOctagon, TrendingUp, Zap } from 'lucide-react';

export default function KPICards({ complaints }) {
    const totalOpen = complaints.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
    const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;
    const slaRiskCount = complaints.filter(c => c.sla_risk && c.status !== 'RESOLVED').length;

    const cards = [
        { 
            label: 'Active Vectors', 
            count: totalOpen, 
            icon: Ticket, 
            color: 'text-sky-400', 
            bg: 'bg-sky-400/5', 
            shadow: 'shadow-sky-500/5',
            accent: 'bg-sky-500'
        },
        { 
            label: 'Resolved Units', 
            count: resolvedCount, 
            icon: CheckCircle, 
            color: 'text-emerald-400', 
            bg: 'bg-emerald-400/5', 
            shadow: 'shadow-emerald-500/5',
            accent: 'bg-emerald-500'
        },
        { 
            label: 'Imminent Breaches', 
            count: slaRiskCount, 
            icon: AlertOctagon, 
            color: 'text-rose-400', 
            bg: 'bg-rose-400/5', 
            shadow: 'shadow-rose-500/5',
            accent: 'bg-rose-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((card, i) => (
                <motion.div 
                    key={i}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className={`glass-card p-8 rounded-[2.5rem] premium-border flex flex-col justify-between min-h-[180px] relative overflow-hidden group ${card.shadow}`}
                >
                    <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">{card.label}</p>
                            <p className="text-5xl font-black text-white tracking-tighter italic">{card.count}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center border border-white/5`}>
                            <card.icon className={`w-7 h-7 ${card.color}`} />
                        </div>
                    </div>
                    
                    <div className="mt-8 space-y-4 relative z-10">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Zap size={10} className={card.color} />
                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] font-mono ${card.color}`}>Protocol Synchronized</span>
                            </div>
                            <span className="text-[10px] font-black text-white/20 font-mono italic">NODE_{i+1}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950/50 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (card.count / 20) * 100)}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={`h-full ${card.accent} rounded-full`} 
                                style={{ boxShadow: `0 0 10px ${card.color.replace('text-', 'var(--')}` }}
                            />
                        </div>
                    </div>

                    {/* Industrial pattern overlay */}
                    <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl pointer-events-none group-hover:bg-white/[0.05] transition-colors" />
                </motion.div>
            ))}
        </div>
    );
}
