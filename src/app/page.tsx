import CityTableClient from "@/components/CityTableClient";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Explore Cities</h1>
        <p className="text-muted-foreground">
          Search, filter, and sort through cities worldwide. Click on a city to view its weather forecast.
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
