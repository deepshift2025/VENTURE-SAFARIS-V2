
import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { MapPin, Info, X, ZoomIn, ZoomOut, RotateCcw, Loader2 } from 'lucide-react';

interface TourismSite {
  id: string;
  name: string;
  country: string;
  coordinates: { lat: number; lng: number };
  description: string;
  highlights: string[];
  image: string;
}

const TOURISM_SITES: TourismSite[] = [
  {
    id: 'bwindi',
    name: 'Bwindi Impenetrable Forest',
    country: 'Uganda',
    coordinates: { lat: -1.05, lng: 29.61 },
    description: 'Home to nearly half of the world\'s remaining mountain gorillas.',
    highlights: ['Gorilla Trekking', 'Bird Watching', 'Nature Walks'],
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80'
  },
  {
    id: 'murchison',
    name: 'Murchison Falls',
    country: 'Uganda',
    coordinates: { lat: 2.25, lng: 31.85 },
    description: 'Where the Nile forces its way through a narrow gap in the rocks.',
    highlights: ['Boat Safari', 'Game Drives', 'Hiking to the top'],
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80'
  },
  {
    id: 'maasai-mara',
    name: 'Maasai Mara National Reserve',
    country: 'Kenya',
    coordinates: { lat: -1.5, lng: 35.0 },
    description: 'World-famous for the Great Migration and exceptional wildlife.',
    highlights: ['Great Migration', 'Hot Air Balloon', 'Maasai Culture'],
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80'
  },
  {
    id: 'mt-kenya',
    name: 'Mount Kenya',
    country: 'Kenya',
    coordinates: { lat: -0.15, lng: 37.3 },
    description: 'The highest mountain in Kenya and the second-highest in Africa.',
    highlights: ['Mountain Climbing', 'Scenic Views', 'Unique Flora'],
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80'
  },
  {
    id: 'serengeti',
    name: 'Serengeti National Park',
    country: 'Tanzania',
    coordinates: { lat: -2.3, lng: 34.8 },
    description: 'Vast plains famous for the annual migration of over 1.5 million wildebeest.',
    highlights: ['Endless Plains', 'Big Five', 'Safari Camps'],
    image: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&q=80'
  },
  {
    id: 'kilimanjaro',
    name: 'Mount Kilimanjaro',
    country: 'Tanzania',
    coordinates: { lat: -3.06, lng: 37.35 },
    description: 'The highest peak in Africa and the tallest free-standing mountain in the world.',
    highlights: ['Summit Trekking', 'Seven Routes', 'Glacial Peaks'],
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80'
  },
  {
    id: 'ngorongoro',
    name: 'Ngorongoro Crater',
    country: 'Tanzania',
    coordinates: { lat: -3.2, lng: 35.5 },
    description: 'The world\'s largest inactive, intact and unfilled volcanic caldera.',
    highlights: ['Crater Floor Safari', 'Rhino Sightings', 'Stunning Landscapes'],
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80'
  },
  {
    id: 'zanzibar',
    name: 'Zanzibar (Stone Town)',
    country: 'Tanzania',
    coordinates: { lat: -6.16, lng: 39.2 },
    description: 'A historic trade center with winding alleys and beautiful beaches.',
    highlights: ['Spice Tours', 'Pristine Beaches', 'Swahili Culture'],
    image: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&q=80'
  }
];

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '40px'
};

const center = {
  lat: -1.286389,
  lng: 36.817223 // Nairobi as center
};

const mapOptions = {
  disableDefaultUI: false,
  mapTypeId: 'hybrid', // Satellite with labels for a "3D" feel
  styles: [
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }]
    }
  ],
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: false,
};

const ExploreMap: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedSite, setSelectedSite] = useState<TourismSite | null>(null);
  const [hoveredSite, setHoveredSite] = useState<TourismSite | null>(null);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] bg-stone-100 rounded-[40px] flex flex-col items-center justify-center gap-4 border border-stone-200">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
        <p className="text-stone-500 font-bold animate-pulse">Loading Global Explorer...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] bg-stone-50 rounded-[40px] overflow-hidden border border-stone-200 shadow-inner">
      <div className="absolute top-8 left-8 z-10 max-w-xs pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] border border-white/20 shadow-xl">
          <h2 className="text-3xl font-black text-emerald-950 mb-2">Explore East Africa</h2>
          <p className="text-stone-500 text-sm font-medium leading-relaxed">
            Discover iconic tourism sites across Uganda, Kenya, and Tanzania. Click on markers to learn more about each destination.
          </p>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={6}
        onLoad={setMap}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {TOURISM_SITES.map((site) => (
          <MarkerF
            key={site.id}
            position={site.coordinates}
            onClick={() => setSelectedSite(site)}
            onMouseOver={() => setHoveredSite(site)}
            onMouseOut={() => setHoveredSite(null)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#f59e0b',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
              scale: 8,
            }}
          />
        ))}

        {hoveredSite && (
          <InfoWindowF
            position={hoveredSite.coordinates}
            options={{ 
              pixelOffset: new google.maps.Size(0, -10),
              maxWidth: 250
            }}
          >
            <div className="p-2 max-w-[240px] animate-in fade-in duration-200">
              <div className="flex gap-3">
                {hoveredSite.image && (
                  <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-stone-100">
                    <img src={hoveredSite.image} className="w-full h-full object-cover" alt="" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{hoveredSite.country}</span>
                  </div>
                  <h3 className="font-black text-emerald-950 text-xs mb-1 leading-tight truncate">{hoveredSite.name}</h3>
                  <p className="text-[10px] text-stone-600 font-medium leading-tight line-clamp-2">
                    {hoveredSite.description}
                  </p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-stone-50 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-700">
                  <Info size={10} />
                  <span>Click for full details</span>
                </div>
              </div>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Selected Site Modal */}
      {selectedSite && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-8 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedSite(null)} 
              className="absolute top-6 right-6 p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors z-10"
            >
              <X size={20} className="text-stone-600" />
            </button>
            
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-1/2 h-64 md:h-auto overflow-hidden">
                <img src={selectedSite.image} className="w-full h-full object-cover" alt={selectedSite.name} />
              </div>
              <div className="md:w-1/2 p-10 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-emerald-600" />
                    <span className="text-xs font-black uppercase tracking-widest text-stone-400">{selectedSite.country}</span>
                  </div>
                  <h2 className="text-3xl font-black text-emerald-950 leading-tight">{selectedSite.name}</h2>
                </div>
                
                <p className="text-stone-600 font-medium leading-relaxed">
                  {selectedSite.description}
                </p>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Key Highlights</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSite.highlights.map(h => (
                      <span key={h} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-700/20 flex items-center justify-center gap-2">
                    <Info size={16} /> Plan a Visit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreMap;
