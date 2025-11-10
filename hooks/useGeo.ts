import { useEffect, useState } from 'react';
type Geo = { lat: number; lng: number } | null;

export function useGeo(ask = false) {
  const [geo, setGeo] = useState<Geo>(null);
  const [error, setError] = useState<string| null>(null);

  useEffect(() => {
    if (!ask || !('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      p => setGeo({ lat: p.coords.latitude, lng: p.coords.longitude }),
      err => setError(err.message),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, [ask]);

  return { geo, error };
}
