"use client";

import type { City, CityApiResponse, CachedWeatherData } from "@/lib/types";
import { GEONAMES_BASE_URL } from "@/lib/apiConstants";
import { useWeatherDataContext } from "@/contexts/WeatherDataContext";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, ArrowDown, ArrowUp, AlertTriangle, CloudSun, CloudMoon } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce"; 


const ROWS_PER_PAGE = 20;

type SortableColumns = "name" | "cou_name_en" | "population" | "timezone";

interface SortConfig {
  key: SortableColumns;
  direction: "asc" | "desc";
}

async function fetchCities({ pageParam = 0, searchTerm = "", sortBy = "name", sortOrder = "asc" }): Promise<CityApiResponse> {
  const offset = pageParam * ROWS_PER_PAGE;
  let url = `${GEONAMES_BASE_URL}?limit=${ROWS_PER_PAGE}&offset=${offset}&order_by=${sortBy} ${sortOrder.toUpperCase()}`;
  if (searchTerm) {
    // API uses `search(field, "query")` or `field:"query"` for exact, `field LIKE "query*"` for starts with
    // Using `search` as it's generally more flexible for partial matches.
    url += `&where=search(name, "${searchTerm}") OR search(cou_name_en, "${searchTerm}")`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  // The API response structure seems to be { total_count, results: [] }
  // If it's directly an array, adjust accordingly.
  return data as CityApiResponse;
}


export default function CityTableClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "name", direction: "asc" });
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { getCachedWeather } = useWeatherDataContext();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery<CityApiResponse, Error>(
    {
      queryKey: ["cities", debouncedSearchTerm, sortConfig],
      queryFn: ({ pageParam }) => fetchCities({ pageParam: pageParam as number, searchTerm: debouncedSearchTerm, sortBy: sortConfig.key, sortOrder: sortConfig.direction }),
      getNextPageParam: (lastPage, allPages) => {
        const currentResultsCount = allPages.reduce((acc, page) => acc + page.results.length, 0);
        if (currentResultsCount < lastPage.total_count) {
          return allPages.length; // Next page index
        }
        return undefined; // No more pages
      },
      initialPageParam: 0,
    }
  );

  const observer = useRef<IntersectionObserver | null>(null);
  const lastCityElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (isFetchingNextPage || isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]
  );

  const allCities = useMemo(() => data?.pages.flatMap((page) => page.results) ?? [], [data]);

  const handleSort = (key: SortableColumns) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };
  
  const SortIcon = ({ columnKey }: { columnKey: SortableColumns }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? <ArrowUp className="h-4 w-4 inline ml-1" /> : <ArrowDown className="h-4 w-4 inline ml-1" />;
  };

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full md:w-1/3" />
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {['City Name', 'Country', 'Population', 'Timezone', 'Weather'].map(header => (
                            <TableHead key={header}><Skeleton className="h-4 w-20" /></TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(10)].map((_, i) => (
                        <TableRow key={i}>
                            {[...Array(5)].map((_, j) => (
                                <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load city data: {error?.message || "Unknown error"}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search cities or countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            aria-label="Search cities"
          />
        </div>
      </div>

      {allCities.length === 0 && !isLoading && !isFetchingNextPage && (
        <Alert>
          <Search className="h-4 w-4" />
          <AlertTitle>No Cities Found</AlertTitle>
          <AlertDescription>
            No cities match your current search or filters. Try a different search term.
          </AlertDescription>
        </Alert>
      )}

      {allCities.length > 0 && (
        <div className="rounded-md border shadow-sm bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort("name")} className="cursor-pointer hover:bg-muted/80">
                    City Name <SortIcon columnKey="name" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("cou_name_en")} className="cursor-pointer hover:bg-muted/80">
                    Country <SortIcon columnKey="cou_name_en" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("population")} className="cursor-pointer hover:bg-muted/80 text-right">
                    Population <SortIcon columnKey="population" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("timezone")} className="cursor-pointer hover:bg-muted/80">
                    Timezone <SortIcon columnKey="timezone" />
                  </TableHead>
                  
                </TableRow>
              </TableHeader>
              <TableBody>
                {allCities.map((city, index) => {
                  const cached = getCachedWeather(city.geoname_id);
                  const isLastElement = index === allCities.length - 1;
                  return (
                    <TableRow key={city.geoname_id} ref={isLastElement ? lastCityElementRef : null} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Link
                          href={`/weather?name=${encodeURIComponent(city.name)}&lat=${city.coordinates.lat}&lon=${city.coordinates.lon}&id=${city.geoname_id}`}
                          className="text-primary hover:underline"
                        >
                          {city.name}
                        </Link>
                      </TableCell>
                      <TableCell>{city.cou_name_en}</TableCell>
                      <TableCell className="text-right">{city.population?.toLocaleString() || "N/A"}</TableCell>
                      <TableCell>{city.timezone}</TableCell>
                    </TableRow>
                  );
                })}
                {isFetchingNextPage && (
                    [...Array(3)].map((_, i) => (
                        <TableRow key={`skeleton-loading-${i}`}>
                            {[...Array(5)].map((_, j) => (
                                <TableCell key={j}><Skeleton className="h-4 w-full my-2" /></TableCell>
                            ))}
                        </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {hasNextPage && !isFetchingNextPage && allCities.length > 0 && (
         <div className="flex justify-center py-4">
            {/* This button is a fallback if IntersectionObserver fails or for manual load */}
            <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage || !hasNextPage}>
                {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load More" : "Nothing more to load"}
            </Button>
         </div>
      )}
    </div>
  );
}
