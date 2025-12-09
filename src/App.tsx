import React, { useState } from 'react';
import { ESGProvider, useESGData } from './context/ESGContext';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { Overview } from './components/views/Overview';
import { Everything } from './components/views/Everything';
import { Regional } from './components/views/Regional';
import { Explorer } from './components/views/Explorer';
import './index.css';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'regional' | 'explorer' | 'everything'>('overview');
  const { error, loading } = useESGData();

  if (error) {
      return (
          <div className="p-8 text-red-600 bg-white min-h-screen flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Retry
              </button>
          </div>
      );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-4 text-gray-600 font-medium">Loading Dashboard...</span>
      </div>
    );
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && <Overview />}
      {activeTab === 'everything' && <Everything />}
      {activeTab === 'regional' && <Regional />}
      {activeTab === 'explorer' && <Explorer />}
    </DashboardLayout>
  );
};

const App: React.FC = () => {
  return (
    <ESGProvider>
      <AppContent />
    </ESGProvider>
  );
};

export default App;
