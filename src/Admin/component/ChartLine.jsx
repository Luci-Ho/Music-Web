import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';


export default function ChartLine({ data }) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line dataKey="users" stroke="#8884d8" dot={{ r: 3 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}