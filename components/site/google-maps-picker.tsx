'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, AlertCircle, Loader2 } from 'lucide-react';
import { DWARKA_MOR, SERVICE_RADIUS_KM } from '@/lib/supabase';

type Props = {
  onLocationSelect: (lat: number, lng: number, address: string, distance: number) => void;
  initialAddress?: string;
  initialLat?: number | null;
  initialLng?: number | null;
};

declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
  }
}

let googleMapsLoaded = false;
let loadPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (googleMapsLoaded) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const callbackName = 'initGoogleMaps';
    window[callbackName] = () => {
      googleMapsLoaded = true;
      resolve();
    };
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
  return loadPromise;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function GoogleMapsPicker({ onLocationSelect, initialAddress, initialLat, initialLng }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const mapInstance = useRef<any>(null);
  const customerMarker = useRef<any>(null);
  const serviceCenterMarker = useRef<any>(null);
  const radiusCircle = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [address, setAddress] = useState(initialAddress || '');
  const [detecting, setDetecting] = useState(false);

  const updateLocation = useCallback((lat: number, lng: number, addr?: string) => {
    const dist = calculateDistance(lat, lng, DWARKA_MOR.lat, DWARKA_MOR.lng);
    setDistance(dist);

    if (customerMarker.current && mapInstance.current) {
      customerMarker.current.setPosition({ lat, lng });
      mapInstance.current.panTo({ lat, lng });
    }

    if (addr !== undefined) {
      setAddress(addr);
    } else if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
        if (status === 'OK' && results && results[0]) {
          setAddress(results[0].formatted_address);
        }
      });
    }

    onLocationSelect(lat, lng, addr || address, dist);
  }, [address, onLocationSelect]);

  useEffect(() => {
    loadGoogleMaps().then(() => {
      setLoaded(true);
    }).catch(() => {
      setError('Failed to load Google Maps. Please check your connection.');
    });
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: DWARKA_MOR.lat, lng: DWARKA_MOR.lng },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
    mapInstance.current = map;

    // Service center marker (permanent, non-draggable, different color)
    serviceCenterMarker.current = new window.google.maps.Marker({
      position: { lat: DWARKA_MOR.lat, lng: DWARKA_MOR.lng },
      map,
      title: 'AC In Delhi Service Center',
      label: { text: 'S', color: 'white', fontSize: '12px', fontWeight: 'bold' },
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 18,
        fillColor: '#f97316',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      draggable: false,
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: '<div style="font-weight:bold;padding:4px;">AC In Delhi Service Center</div>',
    });
    serviceCenterMarker.current.addListener('click', () => infoWindow.open(map, serviceCenterMarker.current));

    // 10 KM radius circle
    radiusCircle.current = new window.google.maps.Circle({
      map,
      center: { lat: DWARKA_MOR.lat, lng: DWARKA_MOR.lng },
      radius: SERVICE_RADIUS_KM * 1000,
      fillColor: '#1e4d9e',
      fillOpacity: 0.08,
      strokeColor: '#1e4d9e',
      strokeOpacity: 0.5,
      strokeWeight: 2,
    });

    // Customer marker (draggable)
    const initialPosition = initialLat && initialLng
      ? { lat: initialLat, lng: initialLng }
      : { lat: DWARKA_MOR.lat, lng: DWARKA_MOR.lng };

    customerMarker.current = new window.google.maps.Marker({
      position: initialPosition,
      map,
      title: 'Your Location',
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });

    customerMarker.current.addListener('dragend', (e: any) => {
      updateLocation(e.latLng.lat(), e.latLng.lng());
    });

    // Click on map to set location
    map.addListener('click', (e: any) => {
      updateLocation(e.latLng.lat(), e.latLng.lng());
    });

    // Places Autocomplete
    if (autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'in' },
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          updateLocation(lat, lng, place.formatted_address);
        }
      });
    }

    // If initial position is set, calculate distance
    if (initialLat && initialLng) {
      updateLocation(initialLat, initialLng, initialAddress);
    }
  }, [loaded]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        updateLocation(latitude, longitude);
        setDetecting(false);
      },
      () => {
        setError('Unable to get your location. Please search your address or click on the map.');
        setDetecting(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const inServiceArea = distance !== null && distance <= SERVICE_RADIUS_KM;

  return (
    <div className="space-y-3">
      <Label className="mb-1.5 block">Location (within 10 KM of Dwarka Mor) *</Label>

      {/* Address search with Places Autocomplete */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <Input
          ref={autocompleteRef}
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Search your address..."
          className="pl-10"
        />
      </div>

      {/* Detect location button */}
      <Button type="button" variant="outline" onClick={detectLocation} disabled={detecting} className="w-full">
        {detecting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Detecting...</> : <><Navigation className="w-4 h-4 mr-2" /> Use Current Location</>}
      </Button>

      {/* Google Map */}
      <div ref={mapRef} className="w-full h-80 rounded-xl overflow-hidden border border-border/50" style={{ minHeight: '320px' }} />

      {/* Distance indicator */}
      {distance !== null && (
        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
          inServiceArea ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          <MapPin className="w-4 h-4" />
          {inServiceArea
            ? `You are ${distance.toFixed(2)} KM from Dwarka Mor. Service available!`
            : `Sorry! Currently we provide AC services only within a 10 KM radius of Dwarka Mor, Delhi. Your location is ${distance.toFixed(2)} KM away.`}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 text-rose-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />{error}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Search your address, click on the map, drag the marker, or use your current location. The orange marker shows our service center at Dwarka Mor. The blue circle shows our 10 KM service area.
      </p>
    </div>
  );
}
