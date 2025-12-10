import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useOfficeData } from '../../context/OfficeContext';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon not showing up in React Leaflet
// We need to import the images directly or use a CDN
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Color markers by region could be implemented with custom icons
// For now, using default blue marker for simplicity

export const OfficeMap: React.FC = () => {
  const { offices, loading, geocodingProgress } = useOfficeData();

  // Filter offices with valid coordinates
  const validOffices = offices.filter(o => o.coordinates !== null);
  
  // Calculate center based on offices or default to world view
  // Centered roughly on Atlantic to show NA and Europe
  const center: [number, number] = [30, -40];
  const zoom = 2;

  if (loading && validOffices.length === 0) {
    return (
      <div className="h-[500px] w-full bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading map data...</p>
        <div className="w-64 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
             <div 
               className="h-full bg-indigo-600 transition-all duration-300"
               style={{ width: `${geocodingProgress * 100}%` }}
             />
        </div>
        <p className="text-xs text-gray-400 mt-2">Geocoding locations: {Math.round(geocodingProgress * 100)}%</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
           <h3 className="text-lg font-semibold text-gray-900">Global Office Locations</h3>
           <p className="text-sm text-gray-500">Employee headcount by office</p>
        </div>
        <div className="text-xs text-gray-500">
            {validOffices.length} offices mapped
        </div>
      </div>
      
      <div className="h-[500px] w-full rounded-lg overflow-hidden border border-gray-200 z-0 relative">
        <MapContainer 
            center={center} 
            zoom={zoom} 
            scrollWheelZoom={false} 
            style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {validOffices.map((office) => (
            <Marker 
                key={office.id} 
                position={[office.coordinates!.lat, office.coordinates!.lng]}
                icon={defaultIcon}
            >
              <Popup>
                <div className="p-1">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{office.name}</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                        <p><span className="font-medium">Region:</span> {office.region}</p>
                        <p><span className="font-medium">Headcount:</span> {office.headcount}</p>
                        {office.squareFootage && (
                            <p><span className="font-medium">Area:</span> {office.squareFootage.toLocaleString()} sf</p>
                        )}
                    </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {geocodingProgress < 1 && (
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs shadow-md border border-gray-200 z-[1000]">
                Loading locations: {Math.round(geocodingProgress * 100)}%
            </div>
        )}
      </div>
    </div>
  );
};

