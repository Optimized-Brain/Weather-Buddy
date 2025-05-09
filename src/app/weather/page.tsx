import WeatherDisplayClient from "@/components/WeatherDisplayClient";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from 'next';

// This type should ideally be imported if shared, or defined if specific to this page's searchParams
interface WeatherPageSearchParams {
  name?: string;
  lat?: string;
  lon?: string;
  id?: string;
}

interface WeatherPageProps {
  searchParams: WeatherPageSearchParams;
}

export async function generateMetadata({ searchParams }: WeatherPageProps): Promise<Metadata> {
  const cityName = searchParams.name ? decodeURIComponent(searchParams.name) : "Weather";
  return {
    title: `${cityName} Forecast - WeatherBuddy`,
    description: `Get the latest weather forecast for ${cityName}.`,
  };
}


export default function WeatherPage({ searchParams }: WeatherPageProps) {
  const { name, lat, lon, id } = searchParams;

  if (!lat || !lon || !id) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold text-destructive">Missing City Information</h1>
        <p className="text-muted-foreground">Latitude, longitude, or city ID is missing. Please select a city from the list.</p>
      </div>
    );
  }

  const cityName = name ? decodeURIComponent(name) : "Selected City";

  return (
    <div className="space-y-6">
      <Suspense fallback={<WeatherPageSkeleton cityName={cityName}/>}>
        <WeatherDisplayClient
          cityName={cityName}
          latitude={parseFloat(lat)}
          longitude={parseFloat(lon)}
          geonameId={id}
        />
      </Suspense>
    </div>
  );
}

function WeatherPageSkeleton({ cityName }: { cityName: string }) {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-3/4 md:w-1/2" /> {/* City Name and Date */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Weather Skeleton */}
        <div className="p-6 rounded-lg shadow-lg bg-card/80">
          <Skeleton className="h-8 w-1/2 mb-2" /> {/* Current Weather Title */}
          <Skeleton className="h-20 w-1/3 mb-4" /> {/* Temp + Icon */}
          <Skeleton className="h-4 w-3/4 mb-2" /> {/* Description */}
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        </div>

        {/* Extra Info Skeleton */}
         <div className="p-6 rounded-lg shadow-lg bg-card/80">
          <Skeleton className="h-8 w-1/2 mb-2" /> {/* Extra Info Title */}
           <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forecast Skeleton */}
      <div>
        <Skeleton className="h-8 w-1/4 mb-4" /> {/* Forecast Title */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg shadow-md bg-card/70">
              <Skeleton className="h-6 w-1/2 mb-2" /> {/* Day Name */}
              <Skeleton className="h-10 w-1/2 mx-auto mb-2" /> {/* Icon */}
              <Skeleton className="h-4 w-3/4 mb-1" /> {/* Temp Max/Min */}
              <Skeleton className="h-3 w-full" /> {/* Description */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

