import { Skeleton } from "@/components/ui/skeleton";

export default function WeatherLoading() {
  return (
    <div className="space-y-8">
      <header className="text-center md:text-left">
        <Skeleton className="h-10 w-3/4 md:w-1/2 mb-2 mx-auto md:mx-0" /> {/* City Name */}
        <Skeleton className="h-6 w-1/2 md:w-1/3 mx-auto md:mx-0" /> {/* Date */}
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Weather Skeleton */}
        <div className="p-6 rounded-lg shadow-lg bg-card/80 md:col-span-2">
          <Skeleton className="h-8 w-1/3 mb-2" /> {/* Current Weather Title */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <Skeleton className="h-20 w-32 mb-2" /> {/* Temp */}
              <Skeleton className="h-6 w-40 mb-2" /> {/* Description */}
              <Skeleton className="h-4 w-48" /> {/* Feels like, High/Low */}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm w-full sm:w-auto mt-4 sm:mt-0">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="w-full h-32 rounded-md mt-6" /> {/* Image Placeholder */}
        </div>

        {/* Details Skeleton */}
         <div className="p-6 rounded-lg shadow-lg bg-card/80">
          <Skeleton className="h-8 w-1/2 mb-4" /> {/* Details Title */}
           <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forecast Skeleton */}
      <div>
        <Skeleton className="h-8 w-1/4 mb-4" /> {/* Forecast Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg shadow-md bg-card/70">
              <Skeleton className="h-6 w-1/2 mb-2 mx-auto" /> {/* Day Name */}
              <Skeleton className="h-10 w-10 rounded-full mx-auto mb-2" /> {/* Icon */}
              <Skeleton className="h-4 w-3/4 mb-1 mx-auto" /> {/* Temp Max/Min */}
              <Skeleton className="h-3 w-full mx-auto" /> {/* Description */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
