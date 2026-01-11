import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';


export default function ChartBar({ data }) {
      // Lấy giá trị lớn nhất trong dữ liệu để chuẩn hoá màu
    const maxValue = Math.max(...data.map((d) => d.listens));

  // Hàm tính màu hồng tuỳ theo value (đậm dần theo giá trị)
    const getPinkShade = (value) => {
        const ratio = value / maxValue; // 0 -> 1
        // Từ hồng nhạt (#f9c5d1) tới hồng đậm (#ec4899)
        const startColor = [249, 197, 209]; // rgb của #f9c5d1
        const endColor = [236, 72, 153];    // rgb của #ec4899

        const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * ratio);
        const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * ratio);
        const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * ratio);

        return `rgb(${r}, ${g}, ${b})`;
    };
  
    return (
        <div className="flex justify-center items-center w-full h-full mt-10">
            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1f1f1f",
                            border: "1px solid #333",
                            color: "#fff",
                        }}
                    />
                    <Bar dataKey="listens" radius={[8, 8, 0, 0]}>
                        {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getPinkShade(entry.listens)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}