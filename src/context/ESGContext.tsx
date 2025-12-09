import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ESGMetric } from '../types/esg';
import { parseESGData } from '../utils/csvParser';

interface ESGContextType {
  metrics: ESGMetric[];
  loading: boolean;
  error: string | null;
  filter: {
    category: string | 'All';
    region: string | 'Global';
  };
  setFilter: React.Dispatch<React.SetStateAction<{ category: string | 'All'; region: string | 'Global' }>>;
}

const ESGContext = createContext<ESGContextType | undefined>(undefined);

export const ESGProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<ESGMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ category: string | 'All'; region: string | 'Global' }>({
    category: 'Basic Info',
    region: 'Global',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Pass filename relative to public root
        const data = await parseESGData('esg_data.csv');
        setMetrics(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load data');
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <ESGContext.Provider value={{ metrics, loading, error, filter, setFilter }}>
      {children}
    </ESGContext.Provider>
  );
};

export const useESGData = () => {
  const context = useContext(ESGContext);
  if (context === undefined) {
    throw new Error('useESGData must be used within an ESGProvider');
  }
  return context;
};

