import React from 'react';
import { useESGData } from '../../context/ESGContext';
import { RegionalBarChart } from '../charts/RegionalBarChart';

export const Regional: React.FC = () => {
  const { metrics, loading, filter, setFilter } = useESGData();

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const categories = Array.from(new Set(metrics.map(m => m.category))).filter(Boolean);
  
  const filteredMetrics = filter.category === 'All' 
    ? metrics 
    : metrics.filter(m => m.category === filter.category);

  // Only show metrics that have regional data
  const metricsWithRegionalData = filteredMetrics.filter(m => Object.keys(m.regions).length > 0);

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
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
        </div>

        {metricsWithRegionalData.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">No regional breakdown available for the selected category.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metricsWithRegionalData.map(metric => (
                    <RegionalBarChart key={metric.id} metric={metric} />
                ))}
            </div>
        )}
    </div>
  );
};

