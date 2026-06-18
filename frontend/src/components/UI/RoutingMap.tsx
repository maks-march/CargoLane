import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RoutingMapProps {
  stops: { address: string; type: string }[];
  hideFloatingWidget?: boolean;
  onRouteCalculated?: (distance: string, duration: string) => void;
}

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="width: 16px; height: 16px; background: ${color}; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const ICONS = {
  start: createCustomIcon('#3D5AFE'),
  end: createCustomIcon('#059669'),
  stop: createCustomIcon('#F59E0B')
};

const GEO_CACHE: Record<string, [number, number]> = {
  'surgut': [61.25, 73.4167], 'ufa': [54.7388, 55.9721],
  'rotterdam': [51.9225, 4.47927], 'warsaw': [52.2297, 21.0122],
  'berlin': [52.5200, 13.4050], 'munich': [48.1351, 11.5820],
  'hamburg': [53.5511, 9.9937], 'milan': [45.4642, 9.1900],
  'paris': [48.8566, 2.3522], 'madrid': [40.4168, -3.7038],
  'moscow': [55.7558, 37.6173], 'москва': [55.7558, 37.6173],
  'ekaterinburg': [56.8389, 60.6057], 'екатеринбург': [56.8389, 60.6057],
  'omsk': [54.9885, 73.3242], 'омск': [54.9885, 73.3242],
  'lviv': [49.8397, 24.0297], 'львов': [49.8397, 24.0297]
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const geocodeCity = async (city: string): Promise<[number, number] | null> => {
  if (!city || city.length < 2) return null;
  const query = city.toLowerCase().split(',')[0].trim();
  
  if (GEO_CACHE[query]) return GEO_CACHE[query];

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch {
    console.warn("Geocoding API limited (429) for", city);
  }
  return null;
};

interface RouteCalculatorProps {
  stops: { address: string; type: string }[];
  onCalc?: (distance: string, duration: string) => void;
  setRouteData: (data: { distanceStr: string; durationStr: string }) => void;
  setRoutePath: (path: [number, number][]) => void;
  setMarkers: (markers: {pos: [number, number], type: string}[]) => void;
}

const RouteCalculator: React.FC<RouteCalculatorProps> = ({ stops, onCalc, setRouteData, setRoutePath, setMarkers }) => {
  const map = useMap();
  
  useEffect(() => {
    let isMounted = true;

    const fetchRoute = async () => {
      if (!stops || stops.length < 2) return;
      
      const validStops = stops.filter(s => s.address && s.address.length > 2);
      if (validStops.length < 2) return;

      const resolvedCoords: {pos: [number, number], type: string}[] = [];
      
      // ИСПРАВЛЕНО: Жесткая последовательная очередь с задержкой 3 секунды
      for (let i = 0; i < validStops.length; i++) {
        if (!isMounted) break; 
        
        const s = validStops[i];
        const coords = await geocodeCity(s.address);
        
        if (coords) {
          resolvedCoords.push({ pos: coords, type: s.type });
        }
        
        // Пауза 3 секунды перед запросом следующего города (если он не в кэше)
        if (i < validStops.length - 1 && !GEO_CACHE[s.address.toLowerCase().split(',')[0].trim()]) {
          await delay(3000);
        }
      }

      if (resolvedCoords.length >= 2 && isMounted) {
        setMarkers(resolvedCoords);
        const bounds = L.latLngBounds(resolvedCoords.map(m => m.pos));
        map.fitBounds(bounds, { padding: [50, 50] });

        const coordsString = resolvedCoords.map(c => `${c.pos[1]},${c.pos[0]}`).join(';');
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const distKm = (route.distance / 1000).toFixed(0);
            const hrs = Math.floor(route.duration / 3600);
            const mins = Math.floor((route.duration % 3600) / 60);
            const durStr = `${hrs}h ${mins}m`;

            if (onCalc) onCalc(distKm, durStr);
            setRouteData({ distanceStr: distKm, durationStr: durStr });
            const path = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
            setRoutePath(path);
          } else {
             setRoutePath(resolvedCoords.map(m => m.pos));
          }
        } catch {
          setRoutePath(resolvedCoords.map(m => m.pos));
        }
      }
    };

    fetchRoute();
    return () => { isMounted = false; };
  }, [stops, map, onCalc, setRouteData, setRoutePath, setMarkers]);

  return null;
};

export const RoutingMap: React.FC<RoutingMapProps> = ({ stops, hideFloatingWidget, onRouteCalculated }) => {
  const [routeData, setRouteData] = useState({ distanceStr: '0', durationStr: '0h 0m' });
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [markers, setMarkers] = useState<{pos: [number, number], type: string}[]>([]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {!hideFloatingWidget && routeData.distanceStr !== '0' && (
        <div style={{
          position: 'absolute', top: '16px', right: '16px', zIndex: 400, background: 'white',
          padding: '12px 16px', borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', gap: '16px'
        }}>
           <div>
              <div style={{ fontSize: '10px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Distance</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#0E1116' }}>{routeData.distanceStr} km</div>
           </div>
           <div style={{ width: '1px', background: '#E6E8EE' }}></div>
           <div>
              <div style={{ fontSize: '10px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Est. Time</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#0E1116' }}>{routeData.durationStr}</div>
           </div>
        </div>
      )}
      
      <MapContainer center={[51.1657, 10.4515]} zoom={4} style={{ height: '100%', width: '100%', zIndex: 1 }} zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <RouteCalculator stops={stops} onCalc={onRouteCalculated} setRouteData={setRouteData} setRoutePath={setRoutePath} setMarkers={setMarkers} />
        
        {markers.map((m, i) => (
          <Marker key={i} position={m.pos} icon={ICONS[m.type as keyof typeof ICONS] || ICONS.stop} />
        ))}
        
        {routePath.length > 1 && (
          <Polyline positions={routePath} color="#3D5AFE" weight={4} opacity={0.7} />
        )}
      </MapContainer>
    </div>
  );
};