// src/providers/AppProviders.tsx
"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Keep commented out
import { Toaster } from "@/components/ui/toaster";
import { WeatherDataContextProvider } from "@/contexts/WeatherDataContext";
import { LocationHistoryProvider } from "@/contexts/LocationHistoryContext";


// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Optional: disable refetch on window focus
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LocationHistoryProvider>
        <WeatherDataContextProvider>
          {children}
          <Toaster />
        </WeatherDataContextProvider>
      </LocationHistoryProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
