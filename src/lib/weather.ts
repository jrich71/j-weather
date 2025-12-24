// Open-Meteo API - Free, no API key required
// https://open-meteo.com/

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // region/state
}

interface OpenMeteoWeather {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  daily: {
    uv_index_max: number[];
  };
}

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    wind_dir: string;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    uv: number;
  };
}

export interface City {
  id: number;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Weather code to condition mapping
// https://open-meteo.com/en/docs#weathervariables
const weatherCodeToCondition: Record<number, { text: string; icon: string }> = {
  0: { text: "Clear sky", icon: "☀️" },
  1: { text: "Mainly clear", icon: "🌤️" },
  2: { text: "Partly cloudy", icon: "⛅" },
  3: { text: "Overcast", icon: "☁️" },
  45: { text: "Foggy", icon: "🌫️" },
  48: { text: "Depositing rime fog", icon: "🌫️" },
  51: { text: "Light drizzle", icon: "🌧️" },
  53: { text: "Moderate drizzle", icon: "🌧️" },
  55: { text: "Dense drizzle", icon: "🌧️" },
  56: { text: "Light freezing drizzle", icon: "🌧️" },
  57: { text: "Dense freezing drizzle", icon: "🌧️" },
  61: { text: "Slight rain", icon: "🌧️" },
  63: { text: "Moderate rain", icon: "🌧️" },
  65: { text: "Heavy rain", icon: "🌧️" },
  66: { text: "Light freezing rain", icon: "🌧️" },
  67: { text: "Heavy freezing rain", icon: "🌧️" },
  71: { text: "Slight snow", icon: "🌨️" },
  73: { text: "Moderate snow", icon: "🌨️" },
  75: { text: "Heavy snow", icon: "🌨️" },
  77: { text: "Snow grains", icon: "🌨️" },
  80: { text: "Slight rain showers", icon: "🌦️" },
  81: { text: "Moderate rain showers", icon: "🌦️" },
  82: { text: "Violent rain showers", icon: "🌦️" },
  85: { text: "Slight snow showers", icon: "🌨️" },
  86: { text: "Heavy snow showers", icon: "🌨️" },
  95: { text: "Thunderstorm", icon: "⛈️" },
  96: { text: "Thunderstorm with slight hail", icon: "⛈️" },
  99: { text: "Thunderstorm with heavy hail", icon: "⛈️" },
};

// Convert wind direction degrees to compass direction
function degreesToDirection(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Celsius to Fahrenheit
function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

export async function searchCities(query: string): Promise<City[]> {
  if (query.length < 2) return [];
  
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  );
  
  if (!response.ok) {
    throw new Error("Failed to search cities");
  }
  
  const data = await response.json();
  
  if (!data.results) return [];
  
  return data.results.map((result: GeocodingResult) => ({
    id: result.id,
    name: result.name,
    region: result.admin1 || "",
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
  }));
}

export async function fetchWeatherByCoords(
  latitude: number, 
  longitude: number,
  cityName: string,
  region: string,
  country: string
): Promise<WeatherData> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&daily=uv_index_max&timezone=auto`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  
  const data: OpenMeteoWeather = await response.json();
  const condition = weatherCodeToCondition[data.current.weather_code] || { text: "Unknown", icon: "❓" };
  
  return {
    location: {
      name: cityName,
      region: region,
      country: country,
      localtime: new Date().toISOString(),
    },
    current: {
      temp_c: Math.round(data.current.temperature_2m),
      temp_f: Math.round(celsiusToFahrenheit(data.current.temperature_2m)),
      condition: {
        text: condition.text,
        icon: condition.icon,
      },
      humidity: data.current.relative_humidity_2m,
      wind_kph: Math.round(data.current.wind_speed_10m),
      wind_dir: degreesToDirection(data.current.wind_direction_10m),
      feelslike_c: Math.round(data.current.apparent_temperature),
      feelslike_f: Math.round(celsiusToFahrenheit(data.current.apparent_temperature)),
      vis_km: 10, // Open-Meteo doesn't provide visibility in free tier
      uv: data.daily.uv_index_max[0] || 0,
    },
  };
}

export async function fetchWeatherByCity(cityName: string): Promise<WeatherData> {
  const cities = await searchCities(cityName);
  
  if (cities.length === 0) {
    throw new Error("City not found");
  }
  
  const city = cities[0];
  return fetchWeatherByCoords(city.latitude, city.longitude, city.name, city.region, city.country);
}
