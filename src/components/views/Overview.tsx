import React from 'react';
import { useESGData } from '../../context/ESGContext';
import { MetricCard } from '../ui/MetricCard';
import { TrendChart } from '../charts/TrendChart';
import { TargetGauge } from '../charts/TargetGauge';
import { OfficeMap } from '../maps/OfficeMap';

export const Overview: React.FC = () => {
  const { metrics, loading, filter, setFilter } = useESGData();

  if (loading) return <div className="p-8 text-center text-gray-500">Loading ESG Data...</div>;

  const categories = Array.from(new Set(metrics.map(m => m.category))).filter(Boolean);
  
  let filteredMetrics;
  if (filter.category === 'All') {
    filteredMetrics = metrics;
  } else if (filter.category === 'Basic Info') {
    // For Summary dashboard, include Basic Info metrics plus Total GHG and EUI
    const basicInfoMetrics = metrics.filter(m => m.category === 'Basic Info');
    const totalGHG = metrics.find(m => m.id === 'ENERGY_019' || m.name === 'Scope 1, 2, and 3 emissions');
    const eui = metrics.find(m => m.id === 'ENERGY_003' || m.name === 'Average EUI');
    
    filteredMetrics = [...basicInfoMetrics];
    if (totalGHG) filteredMetrics.push(totalGHG);
    if (eui) filteredMetrics.push(eui);
  } else {
    filteredMetrics = metrics.filter(m => m.category === filter.category);
  }

  // Sort metrics - special order for Summary dashboard
  let sortedMetrics;
  if (filter.category === 'Basic Info') {
    // Custom order for Summary dashboard: Total Area, Global Employees, Average EUI, Total GHG
    const orderMap: Record<string, number> = {
      'Total Area': 0,
      'Global Employees': 1,
      'Average EUI': 2,
      'Scope 1, 2, and 3 emissions': 3,
    };
    
    sortedMetrics = [...filteredMetrics].sort((a, b) => {
      const orderA = orderMap[a.name] ?? 999;
      const orderB = orderMap[b.name] ?? 999;
      return orderA - orderB;
    });
  } else {
    // Default sorting for other views
    sortedMetrics = [...filteredMetrics].sort((a, b) => {
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
  }

  return (
    <div className="space-y-8">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
                <button 
                    key={cat}
                    onClick={() => setFilter({ ...filter, category: cat })}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter.category === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                    {cat === 'Basic Info' ? 'Summary' : cat}
                </button>
            ))}
        </div>

        {/* Global Office Map - Only show on Summary dashboard */}
        {filter.category === 'Basic Info' && (
            <OfficeMap />
        )}

        {/* KPI Cards Grid - Hide for Energy & Emissions */}
        {filter.category !== 'Energy & Emissions' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sortedMetrics.map(metric => (
                        <MetricCard key={metric.id} metric={metric} />
                    ))}
                </div>

                <div className="h-px bg-gray-200 my-8" />
            </>
        )}

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

