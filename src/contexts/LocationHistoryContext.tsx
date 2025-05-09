// src/contexts/LocationHistoryContext.tsx
"use client";
import type { ViewedLocation } from "@/lib/types";
import type { ReactNode } from "react";
import { createContext, useContext, useState, useCallback, useEffect } from "react";

const MAX_HISTORY_ITEMS = 10;
const LOCATION_HISTORY_KEY = "weatherEyeLocationHistory";

interface LocationHistoryContextType {
  viewedLocations: ViewedLocation[];
  addLocationToHistory: (location: Omit<ViewedLocation, 'timestamp'>) => void;
  clearHistory: () => void;
}

const LocationHistoryContext = createContext<LocationHistoryContextType | undefined>(undefined);

export function LocationHistoryProvider({ children }: { children: ReactNode }) {
  const [viewedLocations, setViewedLocations] = useState<ViewedLocation[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(LOCATION_HISTORY_KEY);
      if (storedHistory) {
        const parsedHistory: ViewedLocation[] = JSON.parse(storedHistory);
        // Ensure timestamps are numbers, sort by most recent
        const validatedHistory = parsedHistory
          .map(loc => ({ ...loc, timestamp: Number(loc.timestamp) }))
          .sort((a, b) => b.timestamp - a.timestamp);
        setViewedLocations(validatedHistory);
      }
    } catch (error) {
      console.error("Failed to load location history from localStorage:", error);
      setViewedLocations([]); // Initialize with empty array on error
    }
  }, []);

  const saveHistoryToLocalStorage = (history: ViewedLocation[]) => {
    try {
      localStorage.setItem(LOCATION_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save location history to localStorage:", error);
    }
  };

  const addLocationToHistory = useCallback((location: Omit<ViewedLocation, 'timestamp'>) => {
    setViewedLocations(prevLocations => {
      const now = Date.now();
      // Remove if already exists to move it to the top (most recent)
      // Check by ID first, then by name and coordinates as a fallback for potential ID mismatches
      const filteredLocations = prevLocations.filter(loc => 
        !(loc.id === location.id || 
          (loc.name === location.name && 
           loc.lat.toFixed(4) === location.lat.toFixed(4) && 
           loc.lon.toFixed(4) === location.lon.toFixed(4)))
      );
      
      const newHistory = [{ ...location, timestamp: now }, ...filteredLocations].slice(0, MAX_HISTORY_ITEMS);
      saveHistoryToLocalStorage(newHistory);
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setViewedLocations([]);
    saveHistoryToLocalStorage([]);
  }, []);

  return (
    <LocationHistoryContext.Provider value={{ viewedLocations, addLocationToHistory, clearHistory }}>
      {children}
    </LocationHistoryContext.Provider>
  );
}

export function useLocationHistory() {
  const context = useContext(LocationHistoryContext);
  if (context === undefined) {
    throw new Error("useLocationHistory must be used within a LocationHistoryProvider");
  }
  return context;
}
