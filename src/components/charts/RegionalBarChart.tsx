import React from 'react';
import type { ESGMetric } from '../../types/esg';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RegionalBarChartProps {
  metric: ESGMetric;
}

export const RegionalBarChart: React.FC<RegionalBarChartProps> = ({ metric }) => {
  const regions = metric.regions;
  const data = Object.entries(regions).map(([region, value]) => ({
    region,
    value
  })).sort((a, b) => b.value - a.value);

  if (data.length === 0) {
      return null;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{metric.name} by Region (2024)</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} />
            <XAxis type="number" />
            <YAxis dataKey="region" type="category" width={120} tick={{ fontSize: 12 }} />
            <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} fill="#6366f1">
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#818cf8'} />
                ))}
            </Bar>
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

