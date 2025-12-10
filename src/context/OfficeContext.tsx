import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Office } from '../types/office';
import { parseOfficeData } from '../utils/officeParser';
import { batchGeocodeOffices } from '../utils/geocoder';

interface OfficeContextType {
  offices: Office[];
  loading: boolean;
  geocodingProgress: number;
  error: string | null;
}

const OfficeContext = createContext<OfficeContextType | undefined>(undefined);

export const OfficeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load initial data from CSV
        const initialOffices = await parseOfficeData('office_data.csv');
        setOffices(initialOffices);
        
        // Start geocoding in background
        const geocodedOffices = await batchGeocodeOffices(initialOffices, (progress) => {
            setGeocodingProgress(progress);
        });
        
        setOffices(geocodedOffices);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load office data:', err);
        setError('Failed to load office locations');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <OfficeContext.Provider value={{ offices, loading, geocodingProgress, error }}>
      {children}
    </OfficeContext.Provider>
  );
};

export const useOfficeData = () => {
  const context = useContext(OfficeContext);
  if (context === undefined) {
    throw new Error('useOfficeData must be used within an OfficeProvider');
  }
  return context;
};

