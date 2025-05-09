// src/components/CurrentLocationWeatherButton.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OPENWEATHERMAP_API_KEY, OPENWEATHERMAP_BASE_URL } from "@/lib/apiConstants";
import type { InterfaceCurrentWeather } from "@/lib/types";

export default function CurrentLocationWeatherButton() {
  const router = useRouter();
  const { toast } = useToast();
  const { loading: geoLoading, position, error: geoError, getCurrentPosition } = useGeolocation({
    enableHighAccuracy: false, // More likely to succeed, less battery
    timeout: 10000, // 10 seconds
    maximumAge: 1000 * 60 * 5 // Cache for 5 minutes
  });
  const [isFetchingCity, setIsFetchingCity] = useState(false);

  const handleLocate = () => {
    // Reset fetching city state in case it was true from a previous attempt
    setIsFetchingCity(false); 
    getCurrentPosition();
  };

  useEffect(() => {
    if (geoError) {
      toast({
        variant: "destructive",
        title: "Geolocation Error",
        description: geoError.message || "Could not get your location. Please ensure location services are enabled.",
      });
      setIsFetchingCity(false); 
    }

    if (position && !geoError && !geoLoading) { // Ensure not still geoLoading
      setIsFetchingCity(true);
      const { latitude, longitude } = position.coords;
      
      fetch(`${OPENWEATHERMAP_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`)
        .then(res => {
          if (!res.ok) {
            res.json().then(errData => {
                 console.error("OpenWeatherMap API error:", errData);
                 throw new Error(errData.message || 'Failed to fetch city data from OpenWeatherMap');
            }).catch(() => {
                 throw new Error('Failed to fetch city data from OpenWeatherMap and parse error');
            });
          }
          return res.json();
        })
        .then((data: InterfaceCurrentWeather) => {
          if (data.id && data.name) {
            router.push(`/weather?name=${encodeURIComponent(data.name)}&lat=${latitude.toFixed(6)}&lon=${longitude.toFixed(6)}&id=${data.id}`);
          } else {
            throw new Error('City ID or name not found in weather data.');
          }
        })
        .catch(err => {
          console.error("Error fetching city for geolocation:", err);
          toast({
            variant: "destructive",
            title: "Weather Lookup Failed",
            description: err.message || "Could not find weather data for your current location.",
          });
        })
        .finally(() => {
          setIsFetchingCity(false);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, geoError, geoLoading, router, toast]); // Not adding getCurrentPosition, as it's stable

  const isLoading = geoLoading || isFetchingCity;

  return (
    <Button onClick={handleLocate} disabled={isLoading} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent-foreground">
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <MapPin className="mr-2 h-5 w-5" />
      )}
      {geoLoading && "Locating..."}
      {isFetchingCity && !geoLoading && "Fetching Weather..."}
      {!isLoading && "Use My Current Location"}
    </Button>
  );
}
