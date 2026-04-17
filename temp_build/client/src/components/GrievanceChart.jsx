import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function GrievanceChart({ complaints }) {
    const data = useMemo(() => {
        const counts = {};
        complaints.forEach(c => {
            counts[c.department] = (counts[c.department] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([department, count]) => ({ department, count }))
            .sort((a, b) => b.count - a.count);
    }, [complaints]);

    // Sentinel Palette: Steel Blue, Sky, Slate, Indigo
    const colors = ['#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'];

    return (
        <div className="w-full h-full relative group min-h-[350px]">
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 40 }}>
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.6} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                        dataKey="department" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#475569', fontSize: 9, fontWeight: 900 }}
                        dy={15}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                    />
                    <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                    />
                    <Tooltip 
                        cursor={{ fill: 'rgba(56,189,248,0.05)', radius: 12 }}
                        contentStyle={{ 
                            backgroundColor: '#020617', 
                            borderRadius: '24px', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
                            padding: '16px 20px',
                            backdropFilter: 'blur(12px)'
                        }}
                        itemStyle={{ color: '#38bdf8', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase' }}
                        labelStyle={{ color: '#64748b', fontWeight: 900, marginBottom: '8px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'monospace' }}
                        formatter={(value) => [`${value} Units`, 'LOAD']}
                    />
                    <Bar 
                        dataKey="count" 
                        radius={[8, 8, 8, 8]}
                        barSize={28}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            
            <div className="absolute top-0 right-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono">Live Node Metrics</span>
            </div>
        </div>
    );
}
