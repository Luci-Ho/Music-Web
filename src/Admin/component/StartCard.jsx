import React from 'react';
import { Card } from 'antd';


export default function StatCard({ title, value }) {
return (
    <Card className="stat-card">
        <div className="title">{title}</div>
        <div className="value">{value}</div>
    </Card>
);
}