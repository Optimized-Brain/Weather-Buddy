import CityTableClient from "@/components/CityTableClient";
import CurrentLocationWeatherButton from "@/components/CurrentLocationWeatherButton";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Welcome to WeatherEye</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your friendly companion for worldwide weather forecasts.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-center text-card-foreground">Find Weather Instantly</h2>
        <p className="text-center text-muted-foreground max-w-md">
          Automatically detect your current location or search for any city around the globe.
        </p>
        <CurrentLocationWeatherButton />
      </div>
      
      <Separator className="my-8" />

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Or Explore Cities Manually</h2>
        <p className="text-muted-foreground mt-1">
          Search, filter, and sort through cities. Click on a city to view its weather forecast.
        </p>
      </div>
      <Suspense fallback={<CityTableSkeleton />}>
        <CityTableClient />
      </Suspense>
    </div>
  );
}

function CityTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                {[...Array(5)].map((_, i) => (
                  <th key={i} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {[...Array(10)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap text-sm">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
  );
}
