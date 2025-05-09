"use client"; 

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function WeatherError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Weather Page Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] text-center p-4">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-2xl font-semibold text-destructive mb-3">Failed to Load Weather Data</h2>
      <p className="text-md text-muted-foreground mb-4">
        We couldn't fetch the weather information for this city. This might be a temporary issue.
      </p>
      {error?.message && <p className="text-sm bg-destructive/10 p-2 rounded-md text-destructive mb-6 max-w-md">Error: {error.message}</p>}
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          variant="outline"
          size="lg"
        >
          <RotateCcw className="mr-2 h-4 w-4" /> Try Again
        </Button>
        <Button asChild size="lg" variant="default">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}
