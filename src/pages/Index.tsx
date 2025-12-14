import { useState } from "react";
import { CitySearch } from "@/components/CitySearch";
import { WeatherDisplay } from "@/components/WeatherDisplay";
import { Cloud, CloudRain, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

interface WeatherData {
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

export default function Index() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchWeather = async (city: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`
      );

      if (!response.ok) {
        throw new Error("City not found");
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not fetch weather data. Please check the city name and try again.",
        variant: "destructive",
      });
      setWeatherData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen sky-gradient relative overflow-hidden">
      {/* Decorative clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Cloud className="absolute top-20 left-10 h-16 w-16 text-card/30 animate-float" style={{ animationDelay: "0s" }} />
        <Cloud className="absolute top-32 right-20 h-24 w-24 text-card/20 animate-float" style={{ animationDelay: "2s" }} />
        <Cloud className="absolute top-60 left-1/4 h-12 w-12 text-card/25 animate-float" style={{ animationDelay: "1s" }} />
        <Sun className="absolute top-16 right-16 h-20 w-20 text-weather-warm/30 animate-float" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 glass rounded-2xl">
              <CloudRain className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
            Weather Forecast
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Get real-time weather updates for any city around the world
          </p>
        </header>

        <div className="space-y-10">
          <CitySearch onCitySelect={fetchWeather} isLoading={isLoading} />

          {weatherData && <WeatherDisplay data={weatherData} />}

          {!weatherData && !isLoading && (
            <div className="text-center py-16 animate-fade-in">
              <div className="glass rounded-3xl p-12 max-w-md mx-auto">
                <Cloud className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Search for a city to see the current weather conditions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
