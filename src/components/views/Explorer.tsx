import React, { useState } from 'react';
import { useESGData } from '../../context/ESGContext';
import { Search, Info } from 'lucide-react';

export const Explorer: React.FC = () => {
  const { metrics, loading } = useESGData();
  const [search, setSearch] = useState('');

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const filtered = metrics.filter(m => 
    (m.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
    (m.id?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
    (m.category?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="space-y-6">
        <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search metrics, categories..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Baseline (2022)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current (2024)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2030 Target</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Quality</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filtered.map((metric) => {
                            const current = metric.dataPoints.find(d => d.year === 2024)?.value;
                            // Find note from any year or just 2024
                            const note = metric.dataPoints.map(d => d.note).filter(Boolean).join('; ');
                            return (
                                <tr key={metric.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{metric.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.category}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 max-w-xs">{metric.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.unit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.baselineValue?.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{current?.toLocaleString() ?? '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.targets[2030]?.value?.toLocaleString() ?? '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {note && (
                                            <div className="group relative inline-block">
                                                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                                <div className="hidden group-hover:block absolute right-0 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                                                    {note}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

