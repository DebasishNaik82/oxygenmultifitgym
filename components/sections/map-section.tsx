'use client';

import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const GYM_LOCATION = { lat: 19.906214, lng: 83.1523893 };

export default function MapSection() {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  if (!API_KEY) {
    return (
      <div className="w-full h-full bg-brand-dark flex items-center justify-center text-white/20 uppercase font-black text-xs tracking-widest">
        Maps API Key Missing
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="w-full h-full min-h-[400px]">
        <Map
          defaultCenter={GYM_LOCATION}
          defaultZoom={15}
          mapId="DEMO_MAP_ID"
          gestureHandling="greedy"
          disableDefaultUI={false}
          colorScheme="DARK"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          <AdvancedMarker position={GYM_LOCATION}>
            <Pin background={'#22c55e'} glyphColor={'#0a0a0a'} borderColor={'#ffffff'} />
          </AdvancedMarker>
        </Map>
      </div>
    </APIProvider>
  );
}
