import React from 'react';
import type { ESGMetric } from '../../types/esg';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendChartProps {
  metric: ESGMetric;
}

export const TrendChart: React.FC<TrendChartProps> = ({ metric }) => {
  const data = [...metric.dataPoints].sort((a, b) => a.year - b.year);
  const target2030 = metric.targets[2030];

  // No flags on the graph itself - normal styling only
  const chartBorderColor = "border-gray-100";
  const chartBgColor = "bg-white";

  const chartData: any[] = data.map(d => ({
    year: d.year,
    actual: d.value,
    note: d.note
  }));

  if (target2030 && data.length > 0) {
    const lastActual = data[data.length - 1];
    // Add connection point logic:
    // We want the projected line to start from the last actual point.
    // So we modify the last data point to include 'projected' = actual value.
    const lastPoint = chartData.find(d => d.year === lastActual.year);
    if (lastPoint) {
      lastPoint.projected = lastActual.value;
    }

    chartData.push({
      year: 2030,
      projected: target2030.value,
      isTarget: true
    });
  }

  return (
    <div className={`h-[350px] w-full p-6 rounded-xl shadow-sm border ${chartBorderColor} ${chartBgColor} flex flex-col`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {metric.name}
      </h3>
      <p className="text-sm text-gray-500 mb-4">Progress towards 2030 Target</p>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="year" />
            <YAxis label={{ value: metric.unit, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip />
            <Legend />
            
            <Area 
              type="monotone" 
              dataKey="actual" 
              name="Actual Performance"
              stroke="#6366f1" 
              fillOpacity={1} 
              fill="url(#colorActual)" 
              strokeWidth={2}
            />
            
            <Line 
              type="monotone" 
              dataKey="projected" 
              name="Projected Path"
              stroke="#9ca3af" 
              strokeDasharray="5 5" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

