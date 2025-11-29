export interface ESGMetric {
  id: string;           // Maps to "Metric ID"
  name: string;         // Maps to "Metric Name"
  category: string;     // Maps to "Environmental Dimensions"
  unit: string;         // Maps to "Units"
  baselineValue: number; // Value from the Baseline Year (e.g., 2022)
  dataPoints: {
    year: number;
    value: number;      // Maps to "Performance"
    note?: string;      // Maps to "Data Quality Note"
  }[];
  targets: {
    2025?: { value: number; label: string };
    2030?: { value: number; label: string }; // Parsed from "Future (2030 Target)"
  };
  regions: Record<string, number>; // Regional breakdown (e.g., North America, Europe)
}

