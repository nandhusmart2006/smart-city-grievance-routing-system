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

    const colors = ['#6366f1', '#818cf8', '#4f46e5', '#4338ca', '#3730a3', '#312e81'];

    return (
        <div className="w-full h-full relative group">
            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                            <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis 
                        dataKey="department" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                        dy={15}
                        interval={0}
                        angle={-15}
                    />
                    <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                    />
                    <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }}
                        contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            borderRadius: '16px', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                            padding: '12px 16px'
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 700, fontSize: '12px' }}
                        labelStyle={{ color: '#6366f1', fontWeight: 900, marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                    />
                    <Bar 
                        dataKey="count" 
                        radius={[6, 6, 6, 6]}
                        barSize={32}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
