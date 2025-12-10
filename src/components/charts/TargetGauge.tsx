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

  // No flags - normal styling only
  const gaugeBorderColor = "border-gray-100";
  const gaugeBgColor = "bg-white";

  if (!target2030 || !baseline) {
      // Calculate percentage change from baseline even without a target
      let changeFromBaseline = 0;
      let changePercent = 0;
      if (baseline > 0 && current > 0) {
        changeFromBaseline = current - baseline;
        changePercent = (changeFromBaseline / baseline) * 100;
      }
      
      // Create a visual gauge showing change from baseline
      // For reduction metrics (like emissions), negative change is good
      // For increase metrics, positive change might be good
      const isEnvironmental = ["Energy & Emissions", "Water", "Waste", "Carbon"].some(c => metric.category.includes(c));
      const isGoodChange = isEnvironmental ? changePercent < 0 : changePercent > 0;
      
      // Normalize change percent to 0-100 for visual display
      // Use absolute value and cap at 100% for visualization
      const absChangePercent = Math.min(100, Math.abs(changePercent));
      const visualProgress = absChangePercent;
      
      // Color based on whether change is good or bad
      const gaugeColor = isGoodChange ? '#22c55e' : '#ef4444'; // green for good, red for bad
      const neutralColor = '#9ca3af'; // gray for no change
      const displayColor = changePercent === 0 ? neutralColor : gaugeColor;
      
      const gaugeData = [
        { name: 'Change', value: visualProgress },
        { name: 'Remaining', value: 100 - visualProgress },
      ];
      
      return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 w-full text-left">
                  {metric.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4 w-full text-left">Change from Baseline</p>
              
              <div className="flex-1 flex flex-col items-center justify-center">
                  {baseline > 0 && current > 0 ? (
                      <>
                          <div className="h-40 w-40 relative mb-4">
                              <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                      <Pie
                                          data={gaugeData}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius={60}
                                          outerRadius={80}
                                          startAngle={90}
                                          endAngle={-270}
                                          dataKey="value"
                                          stroke="none"
                                      >
                                          <Cell fill={displayColor} />
                                          <Cell fill="#f3f4f6" />
                                      </Pie>
                                  </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                  <span className={`text-2xl font-bold ${changePercent === 0 ? 'text-gray-600' : isGoodChange ? 'text-green-600' : 'text-red-600'}`}>
                                      {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                                  </span>
                                  <span className="text-xs text-gray-500">Change</span>
                              </div>
                          </div>
                          
                          <div className="text-center text-xs text-gray-500 space-y-1">
                              <div>Baseline: {baseline.toLocaleString(undefined, { maximumFractionDigits: 1 })} {metric.unit}</div>
                              <div>Current: {current.toLocaleString(undefined, { maximumFractionDigits: 1 })} {metric.unit}</div>
                          </div>
                      </>
                  ) : (
                      <p className="text-gray-400 text-sm">No data available</p>
                  )}
              </div>
          </div>
      );
  }

  // Calculate progress
  const isReduction = target2030.value < baseline;
  
  // Total delta from baseline to target
  const totalRange = Math.abs(target2030.value - baseline);
  
  // Current delta from baseline (how much we've changed)
  const currentDelta = Math.abs(current - baseline);
  
  let progress = 0;
  
  // For reduction targets (target < baseline)
  if (isReduction) {
    // If we've reduced from baseline (current < baseline), calculate progress
    if (current < baseline) {
      // Progress = (reduction achieved / total reduction needed) * 100
      // Example: baseline=639.49, current=552.34, target=0
      // Reduction achieved = 639.49 - 552.34 = 87.15
      // Total reduction needed = 639.49 - 0 = 639.49
      // Progress = (87.15 / 639.49) * 100 = 13.6%
      const reductionAchieved = baseline - current;
      const totalReductionNeeded = baseline - target2030.value;
      if (totalReductionNeeded > 0) {
        progress = (reductionAchieved / totalReductionNeeded) * 100;
      }
    }
  } else {
    // For increase targets (target > baseline)
    if (current > baseline) {
      const increaseAchieved = current - baseline;
      const totalIncreaseNeeded = target2030.value - baseline;
      if (totalIncreaseNeeded > 0) {
        progress = (increaseAchieved / totalIncreaseNeeded) * 100;
      }
    }
  }
  
  // Cap at 100
  progress = Math.min(100, Math.max(0, progress));

  const data = [
    { name: 'Completed', value: progress },
    { name: 'Remaining', value: 100 - progress },
  ];
  
  const COLORS = ['#4f46e5', '#f3f4f6'];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 w-full text-left">
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
            <span className="text-2xl font-bold text-gray-900">
              {Math.round(progress)}%
            </span>
            <span className="text-xs text-gray-500">Complete</span>
        </div>
      </div>
      
      <div className="mt-4 space-y-2 text-center text-sm">
          <div className="text-gray-600">
              Target: <span className="font-medium">{target2030.value === 0 ? '0' : target2030.value.toLocaleString(undefined, { maximumFractionDigits: 1 })} {metric.unit}</span>
          </div>
          <div className="text-gray-500 text-xs">
              Current: <span className="font-medium">{current.toLocaleString(undefined, { maximumFractionDigits: 1 })} {metric.unit}</span>
          </div>
          <div className="pt-2 border-t border-gray-200">
              <span className="text-indigo-600 font-semibold">{progress.toFixed(1)}%</span>
              <span className="text-gray-600 ml-1">Complete</span>
          </div>
      </div>
    </div>
  );
};

