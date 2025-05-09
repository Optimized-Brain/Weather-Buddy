
import type { WeatherCondition, ForecastItem, ProcessedDailyForecast } from "./types";
import {
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, CloudDrizzle, Wind, CloudSun, CloudMoon, Umbrella, Snowflake, ThermometerSun, ThermometerSnowflake
} from "lucide-react";
import type { JSX } from 'react'; // Explicit JSX type import

export function getWeatherIcon(conditionCode: number, iconStr: string, size: number = 24): JSX.Element {
  const isNight = iconStr.includes('n');

  // Thunderstorm
  if (conditionCode >= 200 && conditionCode < 300) {
    return (<CloudLightning size={size} />);
  }
  // Drizzle
  if (conditionCode >= 300 && conditionCode < 400) {
    return (<CloudDrizzle size={size} />);
  }
  // Rain
  if (conditionCode >= 500 && conditionCode < 600) {
    return (<CloudRain size={size} />);
  }
  // Snow
  if (conditionCode >= 600 && conditionCode < 700) {
    return (<CloudSnow size={size} />);
  }
  // Atmosphere (Mist, Smoke, Haze, etc.)
  if (conditionCode >= 700 && conditionCode < 800) {
    return (<CloudFog size={size} />);
  }
  // Clear
  if (conditionCode === 800) {
    return isNight ? (<CloudMoon size={size} />) : (<Sun size={size} />);
  }
  // Few clouds
  if (conditionCode === 801) {
    return isNight ? (<CloudMoon size={size} />) : (<CloudSun size={size} />);
  }
  // Clouds (Scattered, Broken, Overcast)
  if (conditionCode > 801 && conditionCode < 805) {
    return (<Cloud size={size} />);
  }
  
  // Fallback icon
  return isNight ? (<CloudMoon size={size} />) : (<CloudSun size={size} />);
}

export function getWeatherBackgroundClass(mainCondition?: string): string {
  if (!mainCondition) return "weather-bg-default";
  const condition = mainCondition.toLowerCase();
  switch (condition) {
    case "clear":
      return "weather-bg-clear";
    case "clouds":
      return "weather-bg-clouds";
    case "rain":
    case "drizzle":
      return "weather-bg-rain";
    case "snow":
      return "weather-bg-snow";
    case "thunderstorm":
      return "weather-bg-thunderstorm";
    case "mist":
    case "smoke":
    case "haze":
    case "dust":
    case "fog":
    case "sand":
    case "ash":
    case "squall":
    case "tornado":
      return "weather-bg-mist";
    default:
      return "weather-bg-default";
  }
}

export function processHourlyForecastToDaily(forecastItems: ForecastItem[]): ProcessedDailyForecast[] {
  if (!forecastItems || forecastItems.length === 0) return [];

  const dailyData: Record<string, { temps: number[], icons: string[], conditions: WeatherCondition[], pop: number[] }> = {};

  forecastItems.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyData[date]) {
      dailyData[date] = { temps: [], icons: [], conditions: [], pop: [] };
    }
    dailyData[date].temps.push(item.main.temp);
    dailyData[date].icons.push(item.weather[0].icon); // Store icon string
    dailyData[date].conditions.push(item.weather[0]); // Store full condition object
    dailyData[date].pop.push(item.pop);
  });
  
  return Object.keys(dailyData).map(date => {
    const dayInfo = dailyData[date];
    const temp_min = Math.min(...dayInfo.temps);
    const temp_max = Math.max(...dayInfo.temps);
    
    const middayCondition = dayInfo.conditions.find((_cond, index) => {
      // Find the corresponding forecast item to get the hour
      const itemForHour = forecastItems.find(fi => 
        fi.dt_txt.startsWith(date) && 
        fi.weather[0].id === dayInfo.conditions[index].id && 
        fi.weather[0].icon === dayInfo.icons[index] 
      );
      if (itemForHour) {
        const hour = new Date(itemForHour.dt * 1000).getHours();
        return hour >= 12 && hour < 15; // Prefer midday icon
      }
      return false;
    }) || dayInfo.conditions[Math.floor(dayInfo.conditions.length / 2)] || dayInfo.conditions[0]; // Fallback to middle or first


    const precipitationChance = Math.max(...dayInfo.pop) * 100; 

    const dateObj = new Date(date + "T00:00:00"); 
    const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });

    return {
      date,
      dayName,
      temp_min,
      temp_max,
      icon: middayCondition.icon, 
      description: middayCondition.description,
      precipitationChance,
    };
  }).slice(0, 5); 
}

export function formatTemperature(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

export function formatWindSpeed(speed: number): string {
  return `${speed.toFixed(1)} m/s`; 
}

export function formatPressure(pressure: number): string {
  return `${pressure} hPa`;
}

export function formatHumidity(humidity: number): string {
  return `${humidity}%`;
}

export function getUvIndexStyles(uvIndex: number): {text: string; className: string} {
    if (uvIndex <= 2) return { text: "Low", className: "bg-green-500 text-white" };
    if (uvIndex <= 5) return { text: "Moderate", className: "bg-yellow-500 text-black" };
    if (uvIndex <= 7) return { text: "High", className: "bg-orange-500 text-white" };
    if (uvIndex <= 10) return { text: "Very High", className: "bg-red-600 text-white" };
    return { text: "Extreme", className: "bg-purple-600 text-white" };
}

