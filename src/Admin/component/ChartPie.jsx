import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';


const COLORS = ['#ff6bcb', '#7b61ff', '#21d4fd', '#ffd166'];
export default function ChartPie({ data }) {
    return (
        <ResponsiveContainer width="100%" height={240}>
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {data.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
}