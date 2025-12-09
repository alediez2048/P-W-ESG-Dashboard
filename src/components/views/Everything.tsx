import React from 'react';
import { useESGData } from '../../context/ESGContext';
import { MetricCard } from '../ui/MetricCard';
import { TrendChart } from '../charts/TrendChart';
import { TargetGauge } from '../charts/TargetGauge';

export const Everything: React.FC = () => {
  const { metrics, loading } = useESGData();

  if (loading) return <div className="p-8 text-center text-gray-500">Loading ESG Data...</div>;

  // Show all metrics without filtering
  const sortedMetrics = [...metrics].sort((a, b) => {
      const priority = ['Energy & Emissions', 'Water', 'Waste'];
      const pa = priority.indexOf(a.category);
      const pb = priority.indexOf(b.category);
      if (pa !== -1 && pb !== -1) {
          return pa - pb;
      }
      if (pa !== -1) return -1;
      if (pb !== -1) return 1;
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-8">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedMetrics.map(metric => (
                <MetricCard key={metric.id} metric={metric} />
            ))}
        </div>

        <div className="h-px bg-gray-200 my-8" />

        <h3 className="text-xl font-bold text-gray-900">Detailed Trends & Targets</h3>

        {/* Charts Section */}
        <div className="space-y-12">
            {sortedMetrics.map(metric => (
                <div key={metric.id + '-charts'} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <TrendChart metric={metric} />
                    </div>
                    <div className="lg:col-span-1 h-[350px]">
                        <TargetGauge metric={metric} />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

