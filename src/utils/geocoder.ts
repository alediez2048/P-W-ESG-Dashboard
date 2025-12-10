import type { Office } from '../types/office';

// Cache to store geocoded results
const CACHE_KEY = 'office_geocoding_cache';

interface GeocodeCache {
  [key: string]: { lat: number; lng: number };
}

// Load cache from localStorage
const loadCache = (): GeocodeCache => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.error('Failed to load geocode cache', error);
    return {};
  }
};

// Save cache to localStorage
const saveCache = (cache: GeocodeCache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save geocode cache', error);
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Clean office name for better geocoding results
const cleanOfficeName = (name: string): string => {
  // Remove "PW-" prefix
  let cleaned = name.replace(/^PW-/, '');
  
  // Remove trailing details like "NN", "7th Floor", "19th Floor"
  cleaned = cleaned.replace(/\sNN$/, '');
  cleaned = cleaned.replace(/-?\s*\d+(th|st|nd|rd)?\s*Floor.*$/i, '');
  cleaned = cleaned.replace(/-?\s*150$/i, ''); // London-150
  cleaned = cleaned.replace(/-?\s*Georgia Str.*$/i, ''); // Vancouver - Georgia Str
  cleaned = cleaned.replace(/-?\s*Spring Street$/i, ''); // Los Angeles - Spring Street
  cleaned = cleaned.replace(/-?\s*11th ave$/i, ''); // Calgary-11th ave
  cleaned = cleaned.replace(/-?\s*9th ave$/i, ''); // Calgary-9th ave
  cleaned = cleaned.replace(/-?\s*Fort Ward$/i, ''); // Bainbridge-Fort Ward
  
  return cleaned.trim();
};

export const geocodeOffice = async (office: Office): Promise<{ lat: number; lng: number } | null> => {
  const cache = loadCache();
  if (cache[office.name]) {
    return cache[office.name];
  }

  const query = cleanOfficeName(office.name);
  // Add "Perkins&Will" to context if needed, or just city name
  // Using city name is safer for Nominatim
  
  try {
    // Nominatim requires a unique User-Agent
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
      headers: {
        'User-Agent': 'ESG_Dashboard_PW/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed for ${office.name}`);
    }

    const data = await response.json();
    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
      
      // Update cache
      cache[office.name] = result;
      saveCache(cache);
      
      return result;
    }
  } catch (error) {
    console.warn(`Failed to geocode ${office.name}:`, error);
  }

  return null;
};

export const batchGeocodeOffices = async (offices: Office[], onProgress?: (progress: number) => void): Promise<Office[]> => {
  const updatedOffices = [...offices];
  const total = offices.length;
  let processed = 0;

  for (let i = 0; i < updatedOffices.length; i++) {
    const office = updatedOffices[i];
    
    // Skip if already has coordinates
    if (office.coordinates) {
        processed++;
        if (onProgress) onProgress(processed / total);
        continue;
    }

    const coords = await geocodeOffice(office);
    if (coords) {
      updatedOffices[i] = { ...office, coordinates: coords };
    }
    
    processed++;
    if (onProgress) onProgress(processed / total);

    // Rate limiting: 1 request per second for Nominatim
    // Only delay if we actually made a request (not cached)
    const cache = loadCache();
    if (!cache[office.name]) {
        await delay(1100);
    }
  }

  return updatedOffices;
};

