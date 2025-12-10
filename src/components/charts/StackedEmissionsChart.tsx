import React, { useMemo } from 'react';
import type { ESGMetric } from '../../types/esg';
import { ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StackedEmissionsChartProps {
  scope1: ESGMetric | undefined;
  scope2: ESGMetric | undefined;
  scope3: ESGMetric | undefined;
}

export const StackedEmissionsChart: React.FC<StackedEmissionsChartProps> = ({ scope1, scope2, scope3 }) => {
  const chartData = useMemo(() => {
    // Get all unique years from all three metrics
    const allYears = new Set<number>();
    
    [scope1, scope2, scope3].forEach(metric => {
      if (metric) {
        metric.dataPoints.forEach(dp => {
          allYears.add(dp.year);
        });
      }
    });
    
    // Sort years
    const sortedYears = Array.from(allYears).sort((a, b) => a - b);
    
    // Build chart data combining all three scopes
    // Use 0 instead of null for proper stacking
    const data = sortedYears.map(year => {
      const dataPoint: any = { year };
      
      // Get values for each scope for this year - use 0 if no data
      const getValue = (metric: ESGMetric | undefined): number => {
        if (!metric) return 0;
        const dp = metric.dataPoints.find(d => d.year === year);
        return dp ? dp.value : 0;
      };
      
      dataPoint.scope1 = getValue(scope1);
      dataPoint.scope2 = getValue(scope2);
      dataPoint.scope3 = getValue(scope3);
      
      // Calculate total for this year
      dataPoint.total = dataPoint.scope1 + dataPoint.scope2 + dataPoint.scope3;
      
      return dataPoint;
    }).filter(dp => dp.total > 0); // Only include years with at least some data
    
    return data;
  }, [scope1, scope2, scope3]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px] flex items-center justify-center">
        <p className="text-gray-400 text-sm">No emissions data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[500px] flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Historical Emissions by Scope
      </h3>
      <p className="text-sm text-gray-500 mb-4">Scope 1, 2, and 3 GHG Emissions Over Time</p>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScope1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.3}/>
              </linearGradient>
              <linearGradient id="colorScope2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.3}/>
              </linearGradient>
              <linearGradient id="colorScope3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#86efac" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#86efac" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="year" 
              tickFormatter={(value) => value.toString()}
            />
            <YAxis 
              label={{ value: 'tCO2e', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              tickFormatter={(value) => {
                if (typeof value === 'number') {
                  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
                }
                return value;
              }}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip 
              formatter={(value: any, name: string) => {
                if (value === null || value === undefined || value === 0) {
                  // Don't show 0 values in tooltip for better UX
                  return null;
                }
                if (typeof value === 'number') {
                  return [value.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' tCO2e', name];
                }
                return [value, name];
              }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend />
            
            {/* Stacked areas for each scope - order matters for stacking */}
            <Area 
              type="linear" 
              dataKey="scope1" 
              name="Scope 1"
              stackId="emissions"
              stroke="#16a34a" 
              fill="url(#colorScope1)" 
              strokeWidth={2}
              connectNulls={false}
            />
            <Area 
              type="linear" 
              dataKey="scope2" 
              name="Scope 2"
              stackId="emissions"
              stroke="#14b8a6" 
              fill="url(#colorScope2)" 
              strokeWidth={2}
              connectNulls={false}
            />
            <Area 
              type="linear" 
              dataKey="scope3" 
              name="Scope 3"
              stackId="emissions"
              stroke="#86efac" 
              fill="url(#colorScope3)" 
              strokeWidth={2}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

