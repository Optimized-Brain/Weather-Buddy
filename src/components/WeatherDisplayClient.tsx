// src/components/WeatherDisplayClient.tsx
"use client";

import type { InterfaceCurrentWeather, ForecastApiResponse, ProcessedDailyForecast } from "@/lib/types";
import { OPENWEATHERMAP_BASE_URL, OPENWEATHERMAP_API_KEY } from "@/lib/apiConstants";
import { useWeatherDataContext } from "@/contexts/WeatherDataContext";
import { useLocationHistory } from "@/contexts/LocationHistoryContext";
import { getWeatherIcon, getWeatherBackgroundClass, processHourlyForecastToDaily, formatTemperature, formatWindSpeed, formatPressure, formatHumidity } from "@/lib/weatherUtils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import WeatherCard from "./WeatherCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, Thermometer, Wind as WindIcon, Droplets, Gauge, Sunrise, Sunset, CalendarDays, Eye, Umbrella, Snowflake as SnowflakeIcon, AlertTriangle } from "lucide-react";
import Image from "next/image";

interface WeatherDisplayClientProps {
  cityName: string; // Name from URL, fallback
  latitude: number;
  longitude: number;
  geonameId: string; // ID from URL (can be geoname_id or OWM city_id)
}

async function fetchWeatherData(lat: number, lon: number): Promise<{ current: InterfaceCurrentWeather; forecast: ForecastApiResponse }> {
  const currentWeatherUrl = `${OPENWEATHERMAP_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
  const forecastUrl = `${OPENWEATHERMAP_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;

  const [currentResponse, forecastResponse] = await Promise.all([
    fetch(currentWeatherUrl),
    fetch(forecastUrl),
  ]);

  if (!currentResponse.ok) throw new Error(`Failed to fetch current weather: ${currentResponse.statusText}`);
  if (!forecastResponse.ok) throw new Error(`Failed to fetch forecast: ${forecastResponse.statusText}`);
  
  const current = await currentResponse.json();
  const forecast = await forecastResponse.json();
  
  return { current, forecast };
}


export default function WeatherDisplayClient({ cityName, latitude, longitude, geonameId }: WeatherDisplayClientProps) {
  const { updateWeatherCache } = useWeatherDataContext();
  const { addLocationToHistory } = useLocationHistory();
  const [dynamicBackgroundClass, setDynamicBackgroundClass] = useState("weather-bg-default");

  const { data, isLoading, isError, error } = useQuery<{ current: InterfaceCurrentWeather; forecast: ForecastApiResponse }, Error>(
    {
      queryKey: ["weather", latitude, longitude, geonameId], // Added geonameId to queryKey for more specificity
      queryFn: () => fetchWeatherData(latitude, longitude),
    }
  );

  useEffect(() => {
    if (data?.current) {
      const { main, weather, name: apiCityName } = data.current;
      
      // Update weather cache (for city table quick view)
      updateWeatherCache(geonameId, { // geonameId is the ID from URL
        temp: main.temp,
        temp_max: main.temp_max,
        temp_min: main.temp_min,
        description: weather[0]?.description,
        icon: weather[0]?.icon,
      });

      // Add to location history
      addLocationToHistory({
        id: geonameId, // ID from URL (could be geoname_id or OWM city_id)
        name: apiCityName || cityName, // Prefer name from API response, fallback to prop from URL
        lat: latitude, // Prop from URL
        lon: longitude, // Prop from URL
      });
      
      const bgClass = getWeatherBackgroundClass(weather[0]?.main);
      setDynamicBackgroundClass(bgClass);
      document.body.className = document.body.className.replace(/weather-bg-\w+/g, '').trim();
      document.body.classList.add(bgClass);
    }
    return () => {
      document.body.className = document.body.className.replace(/weather-bg-\w+/g, '').trim();
      // document.body.classList.add("weather-bg-default"); 
    };
  }, [data, geonameId, cityName, latitude, longitude, updateWeatherCache, addLocationToHistory]);

  if (isLoading) return <WeatherPageSkeletonLayout cityName={cityName}/>;
  if (isError) return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error Fetching Weather</AlertTitle>
      <AlertDescription>{error?.message || "Could not load weather data for this city."}</AlertDescription>
    </Alert>
  );

  if (!data) return <p>No weather data available.</p>;

  const { current, forecast } = data;
  const dailyForecasts = processHourlyForecastToDaily(forecast.list);

  const currentDate = new Date(current.dt * 1000).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="space-y-8">
      <header className="text-center md:text-left">
        <h1 className="text-4xl font-bold text-foreground flex items-center justify-center md:justify-start gap-2">
          <MapPin className="inline-block h-8 w-8 text-primary" /> {current.name || cityName}
        </h1>
        <p className="text-lg text-muted-foreground">{currentDate}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WeatherCard title="Current Weather" icon={getWeatherIcon(current.weather[0].id, current.weather[0].icon, 48)} className="md:col-span-2">
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-6xl font-bold text-primary">{formatTemperature(current.main.temp)}</p>
              <p className="text-xl capitalize text-muted-foreground">{current.weather[0].description}</p>
              <p className="text-sm text-muted-foreground">
                Feels like {formatTemperature(current.main.feels_like)} • High: {formatTemperature(current.main.temp_max)} / Low: {formatTemperature(current.main.temp_min)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm w-full sm:w-auto mt-4 sm:mt-0">
              {[
                { icon: <WindIcon className="h-5 w-5 text-accent" />, label: "Wind", value: formatWindSpeed(current.wind.speed) + (current.wind.deg ? ` ${getWindDirection(current.wind.deg)}` : '') },
                { icon: <Droplets className="h-5 w-5 text-accent" />, label: "Humidity", value: formatHumidity(current.main.humidity) },
                { icon: <Gauge className="h-5 w-5 text-accent" />, label: "Pressure", value: formatPressure(current.main.pressure) },
                { icon: <Eye className="h-5 w-5 text-accent" />, label: "Visibility", value: `${(current.visibility / 1000).toFixed(1)} km` },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  {item.icon}
                  <div>
                    <span className="font-medium block">{item.value}</span>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
           <Image 
              src={`https://picsum.photos/seed/${current.weather[0].main.replace(/\s+/g, '-')}-${current.weather[0].id}/600/200`} 
              alt={current.weather[0].description}
              data-ai-hint={`${current.weather[0].main} weather`}
              width={600} 
              height={200} 
              className="w-full h-32 object-cover rounded-md mt-6"
              priority={false}
            />
        </WeatherCard>

        <WeatherCard title="Details">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground"><Sunrise className="h-5 w-5 text-accent" /> Sunrise</div>
              <span className="font-medium">{new Date(current.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground"><Sunset className="h-5 w-5 text-accent" /> Sunset</div>
              <span className="font-medium">{new Date(current.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
             <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground"><Thermometer className="h-5 w-5 text-accent" /> Sea Level Pressure</div>
              <span className="font-medium">{current.main.sea_level ? formatPressure(current.main.sea_level) : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground"><Thermometer className="h-5 w-5 text-accent" /> Ground Level Pressure</div>
              <span className="font-medium">{current.main.grnd_level ? formatPressure(current.main.grnd_level) : 'N/A'}</span>
            </div>
            {current.rain && current.rain["1h"] && (
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-muted-foreground"><Umbrella className="h-5 w-5 text-accent" /> Rain (1h)</div>
                    <span className="font-medium">{current.rain["1h"]} mm</span>
                </div>
            )}
            {current.snow && current.snow["1h"] && (
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-muted-foreground"><SnowflakeIcon className="h-5 w-5 text-accent" /> Snow (1h)</div>
                    <span className="font-medium">{current.snow["1h"]} mm</span>
                </div>
            )}
          </div>
        </WeatherCard>
      </div>

      {dailyForecasts.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" /> 5-Day Forecast
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {dailyForecasts.map((day) => (
              <WeatherCard 
                key={day.date} 
                title={day.dayName}
                description={new Date(day.date + "T00:00:00").toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                className="text-center"
              >
                <div className="flex flex-col items-center">
                  <div className="my-2 text-4xl text-primary">
                    {getWeatherIcon(0, day.icon, 40)} 
                  </div>
                  <p className="font-semibold text-lg">
                    {formatTemperature(day.temp_max)} / <span className="text-muted-foreground">{formatTemperature(day.temp_min)}</span>
                  </p>
                  <p className="text-xs capitalize text-muted-foreground mt-1 truncate w-full" title={day.description}>{day.description}</p>
                  {day.precipitationChance > 0 && (
                    <p className="text-xs text-blue-500 mt-1">
                      <Umbrella className="h-3 w-3 inline mr-1" /> {day.precipitationChance.toFixed(0)}%
                    </p>
                  )}
                </div>
              </WeatherCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function getWindDirection(deg: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

function WeatherPageSkeletonLayout({ cityName }: { cityName: string }) {
  return (
    <div className="space-y-8">
      <header className="text-center md:text-left">
        <Skeleton className="h-10 w-3/4 md:w-1/2 mb-2 mx-auto md:mx-0" /> {/* City Name */}
        <Skeleton className="h-6 w-1/2 md:w-1/3 mx-auto md:mx-0" /> {/* Date */}
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg shadow-lg bg-card/80 md:col-span-2">
          <Skeleton className="h-8 w-1/3 mb-2" /> 
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <Skeleton className="h-20 w-32 mb-2" /> 
              <Skeleton className="h-6 w-40 mb-2" /> 
              <Skeleton className="h-4 w-48" /> 
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
          <Skeleton className="w-full h-32 rounded-md mt-6" /> 
        </div>

         <div className="p-6 rounded-lg shadow-lg bg-card/80">
          <Skeleton className="h-8 w-1/2 mb-4" /> 
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

      <div>
        <Skeleton className="h-8 w-1/4 mb-4" /> 
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg shadow-md bg-card/70">
              <Skeleton className="h-6 w-1/2 mb-2 mx-auto" /> 
              <Skeleton className="h-10 w-10 rounded-full mx-auto mb-2" /> 
              <Skeleton className="h-4 w-3/4 mb-1 mx-auto" /> 
              <Skeleton className="h-3 w-full mx-auto" /> 
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
