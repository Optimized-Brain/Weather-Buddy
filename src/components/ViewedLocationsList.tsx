// src/components/ViewedLocationsList.tsx
"use client";

import Link from "next/link";
import { useLocationHistory } from "@/contexts/LocationHistoryContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, MapPin } from "lucide-react";

export default function ViewedLocationsList() {
  const { viewedLocations, clearHistory } = useLocationHistory();

  if (viewedLocations.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No locations viewed yet.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 px-4 pt-4">
        <h3 className="text-lg font-semibold flex items-center text-popover-foreground">
          <History className="mr-2 h-5 w-5" />
          Recently Viewed
        </h3>
        <Button variant="ghost" size="sm" onClick={clearHistory} aria-label="Clear history" className="text-popover-foreground hover:bg-muted/50">
          <Trash2 className="mr-1 h-4 w-4" /> Clear
        </Button>
      </div>
      <ScrollArea className="h-[200px] px-2 pb-4"> {/* Reduced px for items to fit better */}
        <ul className="space-y-1 p-2"> {/* Added padding to ul for internal spacing */}
          {viewedLocations.map((location) => (
            <li key={`${location.id}-${location.timestamp}`}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left h-auto py-1.5 px-2 text-popover-foreground hover:bg-muted/50"
                asChild
              >
                <Link
                  href={`/weather?name=${encodeURIComponent(location.name)}&lat=${location.lat}&lon=${location.lon}&id=${location.id}`}
                >
                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="truncate" title={location.name}>{location.name}</span>
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
