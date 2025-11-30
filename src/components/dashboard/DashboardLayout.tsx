import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { LayoutDashboard, Globe, Database, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: 'overview' | 'regional' | 'explorer';
  onTabChange: (tab: 'overview' | 'regional' | 'explorer') => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'regional', label: 'Regional Analysis', icon: Globe },
    { id: 'explorer', label: 'Data Explorer', icon: Database },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900">ESG Dashboard</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={clsx(
        "w-full md:w-64 bg-white border-r border-gray-200 flex-col fixed md:relative z-20 h-[calc(100vh-64px)] md:h-screen transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "md:flex" // Always flex on desktop
      )}>
        <div className="p-6 border-b border-gray-100 hidden md:block">
          <h1 className="text-xl font-bold text-gray-900">ESG Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">Environmental Impact Tracker</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                activeTab === item.id 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">PW</div>
             <div>
                 <p className="text-sm font-medium text-gray-700">Perkins&Will</p>
                 <p className="text-xs text-gray-500">View Only</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-[calc(100vh-64px)] md:h-screen">
        <header className="bg-white border-b border-gray-200 py-4 px-8 hidden md:flex justify-between items-center sticky top-0 z-10">
           <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab === 'explorer' ? 'Data Explorer' : activeTab.replace('-', ' ')}</h2>
           <div className="flex items-center gap-4">
               <span className="text-sm text-gray-500">Last updated: Nov 2025</span>
           </div>
        </header>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

