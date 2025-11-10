// /hooks/useGeo.ts
import { useEffect, useState } from 'react';

export function useGeo(ask: boolean) {
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (!ask || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setGeo(null),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, [ask]);
  return { geo };
}
