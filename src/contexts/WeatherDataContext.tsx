// src/contexts/WeatherDataContext.tsx
"use client";
import type { CachedWeatherData } from "@/lib/types";
import type { ReactNode } from "react";
import { createContext, useContext, useState, useCallback } from "react";

interface WeatherDataContextType {
  weatherCache: Map<string, CachedWeatherData>;
  updateWeatherCache: (geonameId: string, data: Omit<CachedWeatherData, 'id' | 'timestamp'>) => void;
  getCachedWeather: (geonameId: string) => CachedWeatherData | undefined;
}

const WeatherDataContext = createContext<WeatherDataContextType | undefined>(undefined);

const CACHE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

export function WeatherDataContextProvider({ children }: { children: ReactNode }) {
  const [weatherCache, setWeatherCache] = useState<Map<string, CachedWeatherData>>(new Map());

  const updateWeatherCache = useCallback((geonameId: string, data: Omit<CachedWeatherData, 'id' | 'timestamp'>) => {
    setWeatherCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.set(geonameId, { ...data, id: geonameId, timestamp: Date.now() });
      return newCache;
    });
  }, []);

  const getCachedWeather = useCallback((geonameId: string): CachedWeatherData | undefined => {
    const cached = weatherCache.get(geonameId);
    if (cached && (Date.now() - cached.timestamp < CACHE_EXPIRY_MS)) {
      return cached;
    }
    // If expired or not found, remove from cache (or it will be overwritten on next update)
    if (cached && !(Date.now() - cached.timestamp < CACHE_EXPIRY_MS)) {
      setWeatherCache(prevCache => {
        const newCache = new Map(prevCache);
        newCache.delete(geonameId);
        return newCache;
      });
    }
    return undefined;
  }, [weatherCache]);

  return (
    <WeatherDataContext.Provider value={{ weatherCache, updateWeatherCache, getCachedWeather }}>
      {children}
    </WeatherDataContext.Provider>
  );
}

export function useWeatherDataContext() {
  const context = useContext(WeatherDataContext);
  if (context === undefined) {
    throw new Error("useWeatherDataContext must be used within a WeatherDataContextProvider");
  }
  return context;
}
