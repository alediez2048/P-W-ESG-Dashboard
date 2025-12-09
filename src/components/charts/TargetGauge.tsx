import React from 'react';
import type { ESGMetric } from '../../types/esg';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface TargetGaugeProps {
  metric: ESGMetric;
}

export const TargetGauge: React.FC<TargetGaugeProps> = ({ metric }) => {
  const target2030 = metric.targets[2030];
  const current = metric.dataPoints[metric.dataPoints.length - 1]?.value || 0;
  const baseline = metric.baselineValue;

  // Highlight gauge in red if current value is 0 (data not accurate/decision not made)
  const isZeroValue = current === 0;
  const gaugeBorderColor = isZeroValue ? "border-red-500 border-2" : "border-gray-100";
  const gaugeBgColor = isZeroValue ? "bg-red-50" : "bg-white";

  if (!target2030 || !baseline) {
      return (
          <div className={`p-6 rounded-xl shadow-sm border ${gaugeBorderColor} ${gaugeBgColor} h-full flex items-center justify-center`}>
              <p className="text-gray-400 text-sm">No target data available</p>
          </div>
      );
  }

  // Calculate progress
  const isReduction = target2030.value < baseline;
  // const isGoodDirection = isReduction ? current <= baseline : current >= baseline;
  
  // Total delta
  const totalRange = Math.abs(target2030.value - baseline);
  // Current delta from baseline
  const currentDelta = Math.abs(current - baseline);
  
  let progress = 0;
  // If we moved in the right direction
  if ((isReduction && current < baseline) || (!isReduction && current > baseline)) {
      progress = (currentDelta / totalRange) * 100;
  }
  // Cap at 100
  progress = Math.min(100, Math.max(0, progress));

  const data = [
    { name: 'Completed', value: progress },
    { name: 'Remaining', value: 100 - progress },
  ];
  
  const COLORS = ['#4f46e5', '#f3f4f6'];

  return (
    <div className={`p-6 rounded-xl shadow-sm border ${gaugeBorderColor} ${gaugeBgColor} flex flex-col items-center justify-center h-full`}>
      {isZeroValue && (
        <div className="mb-2 px-2 py-1 bg-red-100 border border-red-300 rounded text-xs text-red-700 font-medium w-full">
          ⚠️ Data not available - Decision pending
        </div>
      )}
      <h3 className={isZeroValue ? "text-lg font-semibold text-red-600 mb-2 w-full text-left" : "text-lg font-semibold text-gray-900 mb-2 w-full text-left"}>
        {metric.name}
      </h3>
      <p className="text-sm text-gray-500 mb-4 w-full text-left">Progress to 2030 Goal</p>
      
      <div className="h-40 w-40 relative">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className={isZeroValue ? "text-2xl font-bold text-red-600" : "text-2xl font-bold text-gray-900"}>
              {Math.round(progress)}%
            </span>
            <span className="text-xs text-gray-500">Complete</span>
        </div>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-600">
          Target: <span className="font-medium">{target2030.value.toLocaleString(undefined, { maximumFractionDigits: 1 })} {metric.unit}</span>
      </div>
    </div>
  );
};

