import React from 'react';
import type { ESGMetric } from '../../types/esg';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface MetricCardProps {
  metric: ESGMetric;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, className }) => {
  const sortedData = [...metric.dataPoints].sort((a, b) => a.year - b.year);
  const currentData = sortedData[sortedData.length - 1];
  const previousData = sortedData[sortedData.length - 2];
  
  const currentValue = currentData ? currentData.value : 0;
  const previousValue = previousData ? previousData.value : 0;
  
  let change = 0;
  let changePercent = 0;
  
  if (previousValue !== 0) {
    change = currentValue - previousValue;
    changePercent = (change / previousValue) * 100;
  }

  // Trend logic: For "Energy & Emissions" and "Water", decrease is usually good (Green).
  // For others, might be neutral or increase is good.
  // Default: Green for decrease if category is environmental.
  const isEnvironmental = ["Energy & Emissions", "Water", "Waste", "Carbon"].some(c => metric.category.includes(c));
  
  let trendColor = "text-gray-500";
  let TrendIcon = Minus;
  
  if (change > 0) {
    trendColor = isEnvironmental ? "text-red-500" : "text-green-500";
    TrendIcon = ArrowUp;
  } else if (change < 0) {
    trendColor = isEnvironmental ? "text-green-500" : "text-red-500";
    TrendIcon = ArrowDown;
  }
  
  const formatValue = (val: number) => val.toLocaleString(undefined, { maximumFractionDigits: 2 });

  // Highlight card in red if current value is 0 (data not accurate/decision not made)
  const isZeroValue = currentValue === 0;
  const cardBorderColor = isZeroValue ? "border-red-500 border-2" : "border-gray-100";
  const cardBgColor = isZeroValue ? "bg-red-50" : "bg-white";

  return (
    <div className={twMerge(`p-6 rounded-xl shadow-sm border ${cardBorderColor} ${cardBgColor}`, className)}>
      <div className="flex justify-between items-start mb-4">
        <div>
            <p className="text-sm text-gray-500 font-medium">{metric.category}</p>
            <h3 className="text-lg font-semibold text-gray-900 mt-1 line-clamp-1" title={metric.name}>{metric.name}</h3>
        </div>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-gray-100 text-gray-800 shrink-0 ml-2">
            {metric.unit}
        </span>
      </div>
      
      {isZeroValue && (
        <div className="mb-2 px-2 py-1 bg-red-100 border border-red-300 rounded text-xs text-red-700 font-medium">
          ⚠️ Data not available - Decision pending
        </div>
      )}
      <div className="flex items-end gap-4">
        <div>
            <div className={clsx("text-3xl font-bold", isZeroValue ? "text-red-600" : "text-gray-900")}>
              {formatValue(currentValue)}
            </div>
            <div className="flex items-center mt-1 gap-1">
                <TrendIcon className={clsx("w-4 h-4", trendColor)} />
                <span className={clsx("text-sm font-medium", trendColor)}>
                    {Math.abs(changePercent).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500">vs last year</span>
            </div>
        </div>
        
        <div className="h-16 w-24 ml-auto">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedData}>
                    <Line type="monotone" dataKey="value" stroke={change < 0 && isEnvironmental ? "#22c55e" : "#6366f1"} strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

