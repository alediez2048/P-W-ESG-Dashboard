export interface Office {
  id: string;
  name: string;
  region: string;
  headcount: number;
  squareFootage: number | null;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
}

export interface OfficeData {
  Region: string;
  UniqueSiteName: string;
  SF: string; // Will need parsing
  Headcount: string; // Will need parsing
}

