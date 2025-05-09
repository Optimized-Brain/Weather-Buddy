// src/hooks/useGeolocation.ts
"use client";

import { useState, useCallback } from 'react';

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

interface GeolocationPosition {
  coords: GeolocationCoordinates;
  timestamp: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

interface UseGeolocationState {
  loading: boolean;
  position: GeolocationPosition | null;
  error: GeolocationError | null;
}

export function useGeolocation(options?: PositionOptions) {
  const [state, setState] = useState<UseGeolocationState>({
    loading: false,
    position: null,
    error: null,
  });

  const getCurrentPosition = useCallback(() => {
    if (typeof window !== 'undefined' && !navigator.geolocation) {
      setState(s => ({ ...s, loading: false, error: { code: 0, message: 'Geolocation is not supported by your browser.' } }));
      return;
    }

    setState(s => ({ ...s, loading: true, error: null, position: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({ loading: false, position: pos, error: null });
      },
      (err) => {
        setState({ loading: false, position: null, error: err });
      },
      options
    );
  }, [options]);

  return { ...state, getCurrentPosition };
}
