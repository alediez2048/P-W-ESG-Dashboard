import Papa from 'papaparse';
import type { Office, OfficeData } from '../types/office';

const parseNumber = (value: string): number | null => {
  if (!value || value.trim() === '') return null;
  if (typeof value === 'number') return value;
  
  const cleanValue = value.trim().replace(/,/g, '');
  if (isNaN(parseFloat(cleanValue))) return null;
  
  return parseFloat(cleanValue);
};

export const parseOfficeData = async (relativePath: string): Promise<Office[]> => {
  const baseUrl = import.meta.env.BASE_URL;
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  const url = `${baseUrl}${cleanPath}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as OfficeData[];
          const offices: Office[] = [];

          data.forEach((row, index) => {
            if (!row.UniqueSiteName) return;

            const headcount = parseNumber(row.Headcount);
            const sf = parseNumber(row.SF);

            // Skip entries without headcount as they might be empty placeholders
            // But some might have SF but no headcount or vice-versa. 
            // The request specified displaying employee headcount, so we probably want rows with valid names.
            
            offices.push({
              id: `office-${index}`,
              name: row.UniqueSiteName,
              region: row.Regions || 'NA', // Default to NA if missing, or maybe handle better
              headcount: headcount || 0,
              squareFootage: sf,
              coordinates: null // Will be populated by geocoder
            });
          });

          resolve(offices);
        },
        error: (error: any) => {
            console.error('Papa Parse Error:', error);
            reject(error);
        },
      });
    });
  } catch (error) {
      console.error('parseOfficeData Error:', error);
      throw error;
  }
};

