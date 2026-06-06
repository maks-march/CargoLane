import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RoutingMapProps {
  stops: { address: string; type: string }[];
  hideFloatingWidget?: boolean;
  onRouteCalculated?: (distance: string, duration: string) => void;
}

const GEO_CACHE: Record<string, [number, number]> = {
  'rotterdam': [51.9225, 4.47927],
  'warsaw': [52.2297, 21.0122],
  'berlin': [52.5200, 13.4050],
  'munich': [48.1351, 11.5820],
  'hamburg': [53.5511, 9.9937],
  'milan': [45.4642, 9.1900],
  'antwerp': [51.2194, 4.4025],
  'lyon': [45.7640, 4.8357],
  'paris': [48.8566, 2.3522],
  'madrid': [40.4168, -3.7038]
};

const getCustomDotIcon = (type: string) => {
  let color = '#5C6470'; 
  if (type === 'start') color = '#3D5AFE'; 
  if (type === 'end') color = '#00C48C'; 
  
  return L.divIcon({
    className: 'clear-custom-icon',
    html: `<div style="width: 14px; height: 14px; background: ${color}; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const MapAutoFitter = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView([51.1657, 10.4515], 4);
    }
  }, [positions, map]);
  return null;
};

export const RoutingMap: React.FC<RoutingMapProps> = ({ stops, hideFloatingWidget, onRouteCalculated }) => {
  const [routeData, setRouteData] = useState<{
    markers: { pos: [number, number], type: string }[];
    coordinates: [number, number][];
    distanceStr: string;
    durationStr: string;
  }>({ markers: [], coordinates: [], distanceStr: '', durationStr: '' });

  useEffect(() => {
    let isMounted = true;

    const fetchRoute = async () => {
      const validMarkers: { pos: [number, number], type: string }[] = [];

      for (const stop of stops) {
        const query = stop.address.trim().toLowerCase();
        if (query.length < 3) continue;

        const dictMatch = Object.keys(GEO_CACHE).find(city => query.includes(city));

        if (dictMatch) {
          validMarkers.push({ pos: GEO_CACHE[dictMatch], type: stop.type });
        } else {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
              const pos: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
              GEO_CACHE[query] = pos; 
              validMarkers.push({ pos, type: stop.type });
            }
          } catch (e) {}
        }
      }

      if (!isMounted) return;

      if (validMarkers.length > 1) {
        const coordsString = validMarkers.map(m => `${m.pos[1]},${m.pos[0]}`).join(';');
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
        
        try {
          const res = await fetch(osrmUrl);
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            const route = data.routes[0];
            const geojsonCoords = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
            
            const distKm = (route.distance / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 });
            const hrs = Math.floor(route.duration / 3600);
            const mins = Math.floor((route.duration % 3600) / 60);
            const timeStr = hrs > 0 ? `${hrs} h ${mins} min` : `${mins} min`;

            if (isMounted) {
              setRouteData({ markers: validMarkers, coordinates: geojsonCoords, distanceStr: distKm, durationStr: timeStr });
              if (onRouteCalculated) onRouteCalculated(distKm, timeStr);
            }
          } else {
            if (isMounted) setRouteData({ markers: validMarkers, coordinates: validMarkers.map(m => m.pos), distanceStr: '', durationStr: '' });
          }
        } catch (e) {
          if (isMounted) setRouteData({ markers: validMarkers, coordinates: validMarkers.map(m => m.pos), distanceStr: '', durationStr: '' });
        }
      } else {
        if (isMounted) setRouteData({ markers: validMarkers, coordinates: [], distanceStr: '', durationStr: '' });
      }
    };

    const timeoutId = setTimeout(() => { fetchRoute(); }, 500);
    return () => { isMounted = false; clearTimeout(timeoutId); };
  }, [stops]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {!hideFloatingWidget && routeData.distanceStr && (
        <div style={{
          position: 'absolute', top: 16, right: 16, zIndex: 1000,
          background: 'white', padding: '12px 16px', borderRadius: '12px',
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
      <MapContainer center={[51.1657, 10.4515]} zoom={4} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
        {routeData.markers.map((marker, i) => (
          <Marker key={i} position={marker.pos} icon={getCustomDotIcon(marker.type)} />
        ))}
        {routeData.coordinates.length > 0 && (
          <Polyline positions={routeData.coordinates} color="#3D5AFE" weight={5} />
        )}
        <MapAutoFitter positions={routeData.markers.map(m => m.pos)} />
      </MapContainer>
    </div>
  );
};