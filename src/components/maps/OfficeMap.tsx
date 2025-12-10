import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useOfficeData } from '../../context/OfficeContext';
import { divIcon, LatLngBounds } from 'leaflet';
import { MapPin, Users, Building2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Region color scheme matching dashboard
const REGION_COLORS: Record<string, string> = {
  'Europe': '#6366f1',      // Indigo
  'NA': '#4f46e5',          // Darker indigo
  'LATAM': '#818cf8',       // Light indigo
  'APAC': '#a5b4fc',        // Lighter indigo
};

// Create custom colored markers
const createCustomIcon = (region: string, headcount: number) => {
  const color = REGION_COLORS[region] || '#6366f1';
  const size = Math.max(20, Math.min(40, 20 + (headcount / 10))); // Size based on headcount
  
  return divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size > 30 ? '12px' : '10px'};
      ">
        ${headcount > 99 ? '99+' : headcount}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Component to auto-fit map bounds
const MapBoundsFitter: React.FC<{ offices: Array<{ coordinates: { lat: number; lng: number } | null }> }> = ({ offices }) => {
  const map = useMap();
  
  useEffect(() => {
    const validOffices = offices.filter(o => o.coordinates !== null);
    if (validOffices.length > 0) {
      const bounds = new LatLngBounds(
        validOffices.map(o => [o.coordinates!.lat, o.coordinates!.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
    }
  }, [offices, map]);
  
  return null;
};

export const OfficeMap: React.FC = () => {
  const { offices, loading, geocodingProgress } = useOfficeData();
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set(['Europe', 'NA', 'LATAM', 'APAC']));

  // Filter offices with valid coordinates and selected regions
  const validOffices = useMemo(() => {
    return offices.filter(o => 
      o.coordinates !== null && selectedRegions.has(o.region)
    );
  }, [offices, selectedRegions]);

  // Get unique regions for legend
  const regions = useMemo(() => {
    const uniqueRegions = new Set(offices.map(o => o.region).filter(Boolean));
    return Array.from(uniqueRegions).sort();
  }, [offices]);

  // Calculate center - default to world view
  const center: [number, number] = [30, -40];
  const zoom = 2;

  // Toggle region filter
  const toggleRegion = (region: string) => {
    const newSet = new Set(selectedRegions);
    if (newSet.has(region)) {
      newSet.delete(region);
    } else {
      newSet.add(region);
    }
    setSelectedRegions(newSet);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Global Office Locations</h3>
          <p className="text-sm text-gray-500">Employee headcount by office (2024)</p>
        </div>
        
        {/* Region Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {regions.map(region => (
            <button
              key={region}
              onClick={() => toggleRegion(region)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedRegions.has(region)
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
          <span className="text-gray-600">Marker size = Headcount</span>
        </div>
        {regions.map(region => (
          <div key={region} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: REGION_COLORS[region] || '#6366f1' }}
            ></div>
            <span className="text-gray-600">{region}</span>
          </div>
        ))}
      </div>
      
      <div className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200 z-0 relative">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          {/* Use CartoDB Positron for a cleaner, more professional look */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          
          {/* Auto-fit bounds when offices load */}
          {validOffices.length > 0 && <MapBoundsFitter offices={validOffices} />}
          
          {validOffices.map((office) => (
            <Marker 
              key={office.id} 
              position={[office.coordinates!.lat, office.coordinates!.lng]}
              icon={createCustomIcon(office.region, office.headcount)}
            >
              <Popup className="custom-popup" maxWidth={250}>
                <div className="p-2">
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">{office.name}</h4>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: `${REGION_COLORS[office.region] || '#6366f1'}20`,
                          color: REGION_COLORS[office.region] || '#6366f1'
                        }}
                      >
                        {office.region}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span><span className="font-medium">Headcount:</span> {office.headcount.toLocaleString()}</span>
                    </div>
                    {office.squareFootage && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span><span className="font-medium">Area:</span> {office.squareFootage.toLocaleString()} sf</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Loading indicator */}
        {loading && geocodingProgress < 1 && (
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg text-xs shadow-lg border border-gray-200 z-[1000]">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-indigo-600 border-t-transparent"></div>
              <span className="text-gray-700 font-medium">Loading locations: {Math.round(geocodingProgress * 100)}%</span>
            </div>
          </div>
        )}
        
        {/* Office count badge */}
        {validOffices.length > 0 && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs shadow-lg border border-gray-200 z-[1000]">
            <span className="text-gray-700 font-medium">{validOffices.length} offices</span>
          </div>
        )}
      </div>
    </div>
  );
};
