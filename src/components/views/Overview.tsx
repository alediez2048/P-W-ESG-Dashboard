import React from 'react';
import { useESGData } from '../../context/ESGContext';
import { MetricCard } from '../ui/MetricCard';
import { TrendChart } from '../charts/TrendChart';
import { TargetGauge } from '../charts/TargetGauge';

export const Overview: React.FC = () => {
  const { metrics, loading, filter, setFilter } = useESGData();

  if (loading) return <div className="p-8 text-center text-gray-500">Loading ESG Data...</div>;

  const categories = Array.from(new Set(metrics.map(m => m.category))).filter(Boolean);
  
  const filteredMetrics = filter.category === 'All' 
    ? metrics 
    : metrics.filter(m => m.category === filter.category);

  // Sort metrics by name or priority?
  // Maybe put Energy/Carbon first.
  const sortedMetrics = [...filteredMetrics].sort((a, b) => {
      const priority = ['Energy & Emissions', 'Water', 'Waste'];
      const pa = priority.indexOf(a.category);
      const pb = priority.indexOf(b.category);
      return (pb === -1 ? -1 : pb) - (pa === -1 ? -1 : pa); // simple sort logic? No.
      // If both in priority, lower index is better?
      // Just sort by category then name.
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-8">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button 
                onClick={() => setFilter({ ...filter, category: 'All' })}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter.category === 'All' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
                All Categories
            </button>
            {categories.map(cat => (
                <button 
                    key={cat}
                    onClick={() => setFilter({ ...filter, category: cat })}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter.category === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                    {cat}
                </button>
            ))}
        </div>

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

