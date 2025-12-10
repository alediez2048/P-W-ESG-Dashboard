import Papa from 'papaparse';
import type { ESGMetric } from '../types/esg';

const parseNumber = (value: string): number | null => {
  if (!value || value.trim() === '') return null;
  if (typeof value === 'number') return value;
  
  // Skip non-numeric values like "TBD", "Data collection methodologies under development", etc.
  const cleanValue = value.trim().replace(/,/g, '');
  if (cleanValue === 'TBD' || cleanValue === 'NA' || isNaN(parseFloat(cleanValue))) {
    return null;
  }
  
  return parseFloat(cleanValue);
};

const parseTarget = (targetStr: string, baseline: number): number | undefined => {
  if (!targetStr || !baseline) return undefined;
  
  // Match various formats: 
  // - "60% reduction"
  // - "60% Reduction from baseline"
  // - "60% energy reduction from 2022 baseline"
  // - "60% Reduction from baseline"
  // The regex allows for optional "energy" and anything after "reduction"
  const reductionMatch = targetStr.match(/(\d+(?:\.\d+)?)%\s*(?:energy\s*)?reduction[\s\w%]*/i);
  if (reductionMatch) {
    const percentage = parseFloat(reductionMatch[1]);
    // Calculate: baseline * (1 - percentage/100)
    // Example 1: 41.48 * (1 - 60/100) = 41.48 * 0.4 = 16.592 M kBtu
    // Example 2: 20,203 * (1 - 60/100) = 20,203 * 0.4 = 8,081.2 kBtu/person
    const targetValue = baseline * (1 - percentage / 100);
    return targetValue;
  }
  
  return undefined;
};

export const parseESGData = async (relativePath: string): Promise<ESGMetric[]> => {
  // Construct the correct URL using Vite's base URL
  const baseUrl = import.meta.env.BASE_URL;
  // Remove leading slash from relativePath if present to avoid double slashes
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  const url = `${baseUrl}${cleanPath}`;

  console.log('Fetching CSV from:', url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvText = await response.text();
    console.log('CSV fetched, length:', csvText.length);
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('Papa Parse complete. Rows:', results.data.length);
          const data = results.data as any[];
          const metricsMap = new Map<string, ESGMetric>();

          data.forEach((row) => {
            // Simple validation
            if (!row['Metric Name'] && !row['Metric ID']) return;

            const id = row['Metric ID'] === 'NA' ? row['Metric Name'] : row['Metric ID'];
            if (!id) return;

            if (!metricsMap.has(id)) {
              metricsMap.set(id, {
                id,
                name: row['Metric Name'],
                category: row['Environmental Dimensions'],
                unit: row['Units'],
                baselineValue: 0,
                dataPoints: [],
                targets: {},
                regions: {},
              });
            }

            const metric = metricsMap.get(id)!;
            const year = parseInt(row['Year']);
            const value = parseNumber(row['Performance']);
            const region = row['Region'];

            // Handle Global Data
            if (region === 'Global') {
              // Update baseline if year matches baseline year (2022)
              if (year === 2022 && value !== null) {
                metric.baselineValue = value;
                
                // Parse targets from 2022 row's "Future (2030 Target)" column
                const target2030Str = row['Future (2030 Target)'];
                if (target2030Str && !metric.targets[2030]) {
                   const targetValue = parseTarget(target2030Str, value);
                   if (targetValue !== undefined) {
                     metric.targets[2030] = {
                       value: targetValue,
                       label: target2030Str
                     };
                   }
                }
              }
              
              // Also check 2030 Target row for target information
              if (year === 2030 && row['Value Type'] === 'Target') {
                const target2030Str = row['Future (2030 Target)'] || row['Performance'];
                if (target2030Str && metric.baselineValue > 0 && !metric.targets[2030]) {
                  const targetValue = parseTarget(target2030Str, metric.baselineValue);
                  if (targetValue !== undefined) {
                    metric.targets[2030] = {
                      value: targetValue,
                      label: target2030Str
                    };
                  }
                }
              }
              
              // Only add data points for actual values (not target rows)
              if (value !== null && row['Value Type'] !== 'Target') {
                metric.dataPoints.push({
                  year,
                  value,
                  note: row['Data Quality Note'],
                });
              }
            } else {
               // Handle Regional Data
               // For metrics with "per Region" in the name, each region is a separate metric
               // Store their data as dataPoints so they can be displayed in charts
               if (value !== null) {
                 if (metric.name.includes('per Region')) {
                   // Update metric name to include region for clarity
                   if (!metric.name.includes(region)) {
                     metric.name = `${metric.name} - ${region}`;
                   }
                   
                   // Store as dataPoint (not just in regions object) so charts can display it
                   if (row['Value Type'] !== 'Target') {
                     metric.dataPoints.push({
                       year,
                       value,
                       note: row['Data Quality Note'],
                     });
                     
                     // Also update baseline if year is 2022
                     if (year === 2022) {
                       metric.baselineValue = value;
                     }
                   }
                   
                   // Also store in regions for regional breakdown views
                   if (year === 2024) {
                     metric.regions[region] = value;
                   }
                 } else {
                   // For other metrics, only store 2024 regional values
                   if (year === 2024) {
                     metric.regions[region] = value;
                   }
                 }
               }
            }
          }); // Close data.forEach

          // Sort dataPoints by year
          metricsMap.forEach((metric) => {
            metric.dataPoints.sort((a, b) => a.year - b.year);
          });

          const result = Array.from(metricsMap.values());
          console.log('Parsed Metrics:', result.length);
          resolve(result);
        },
        error: (error: any) => {
            console.error('Papa Parse Error:', error);
            reject(error);
        },
      });
    });
  } catch (error) {
      console.error('parseESGData Error:', error);
      throw error;
  }
};
