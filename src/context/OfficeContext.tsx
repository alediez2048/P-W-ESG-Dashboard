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

// Helper to load cache from localStorage
const loadCache = (): Record<string, { lat: number; lng: number }> => {
  try {
    const cached = localStorage.getItem('office_geocoding_cache');
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

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
        
        // Immediately populate cached coordinates so map shows right away
        const cache = loadCache();
        const officesWithCache = initialOffices.map(office => {
          if (cache[office.name]) {
            return { ...office, coordinates: cache[office.name] };
          }
          return office;
        });
        
        // Show map immediately with cached offices
        setOffices(officesWithCache);
        setLoading(false);
        
        // Geocode remaining offices in background
        const geocodedOffices = await batchGeocodeOffices(initialOffices, (progress) => {
            setGeocodingProgress(progress);
        });
        
        // Update with all geocoded results
        setOffices(geocodedOffices);
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

