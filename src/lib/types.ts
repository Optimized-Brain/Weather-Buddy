export interface City {
  geoname_id: string;
  name: string;
  ascii_name: string;
  alternate_names: string[] | null;
  feature_class: string;
  feature_code: string;
  country_code: string;
  cou_name_en: string;
  country_code_2: string | null;
  admin1_code: string;
  admin2_code: string | null;
  admin3_code: string | null;
  admin4_code: string | null;
  population: number;
  elevation: number | null;
  dem: number;
  timezone: string;
  modification_date: string;
  label_en: string;
  coordinates: {
    lon: number;
    lat: number;
  };
}

export interface CityApiResponse {
  total_count: number;
  results: City[];
}

export interface WeatherMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface Wind {
  speed: number;
  deg: number;
  gust?: number;
}

export interface Clouds {
  all: number;
}

export interface Rain {
  "1h"?: number;
  "3h"?: number;
}

export interface Snow {
  "1h"?: number;
  "3h"?: number;
}

export interfaceCurrentWeather {
  coord: {
    lon: number;
    lat: number;
  };
  weather: WeatherCondition[];
  base: string;
  main: WeatherMain;
  visibility: number;
  wind: Wind;
  clouds: Clouds;
  rain?: Rain;
  snow?: Snow;
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastItem extends Omit<InterfaceCurrentWeather, 'sys' | 'coord' | 'id' | 'name' | 'cod' | 'base' | 'visibility' | 'timezone'> {
  dt_txt: string;
  pop: number; // Probability of precipitation
}

export interface ForecastApiResponse {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface ProcessedDailyForecast {
  date: string;
  dayName: string;
  temp_min: number;
  temp_max: number;
  icon: string;
  description: string;
  precipitationChance: number;
}

export interface CachedWeatherData {
  id: string; // geoname_id
  temp?: number;
  temp_max?: number;
  temp_min?: number;
  description?: string;
  icon?: string;
  timestamp: number; // To potentially expire cache
}
