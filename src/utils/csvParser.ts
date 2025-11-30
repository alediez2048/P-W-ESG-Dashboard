import Papa from 'papaparse';
import type { ESGMetric } from '../types/esg';

const parseNumber = (value: string): number => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value.replace(/,/g, ''));
};

const parseTarget = (targetStr: string, baseline: number): number | undefined => {
  if (!targetStr || !baseline) return undefined;
  
  const reductionMatch = targetStr.match(/(\d+(?:\.\d+)?)%\s*(?:energy\s*)?reduction/i);
  if (reductionMatch) {
    const percentage = parseFloat(reductionMatch[1]);
    return baseline * (1 - percentage / 100);
  }
  
  return undefined;
};

export const parseESGData = async (url: string): Promise<ESGMetric[]> => {
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
              if (year === 2022) {
                metric.baselineValue = value;
                
                // Parse targets
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

              metric.dataPoints.push({
                year,
                value,
                note: row['Data Quality Note'],
              });
            } else {
               // Handle Regional Data (store 2024 values)
               if (year === 2024) {
                 metric.regions[region] = value;
               }
            }
          });

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
