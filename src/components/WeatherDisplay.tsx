import { Cloud, Droplets, Wind, Thermometer, Eye, Sun } from "lucide-react";

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

interface WeatherDisplayProps {
  data: WeatherData;
}

export function WeatherDisplay({ data }: WeatherDisplayProps) {
  const { location, current } = data;

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-slide-up">
      <div className="glass rounded-3xl p-8 space-y-6">
        {/* Location Header */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            {location.name}
          </h2>
          <p className="text-muted-foreground">
            {location.region && `${location.region}, `}{location.country}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatTime(location.localtime)}
          </p>
        </div>

        {/* Main Weather */}
        <div className="flex items-center justify-center gap-4">
          <img
            src={`https:${current.condition.icon}`}
            alt={current.condition.text}
            className="w-24 h-24 animate-float"
          />
          <div className="text-center">
            <p className="text-7xl font-bold text-foreground tracking-tight">
              {Math.round(current.temp_c)}°
            </p>
            <p className="text-lg text-muted-foreground font-medium">
              {current.condition.text}
            </p>
          </div>
        </div>

        {/* Feels Like */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Feels like{" "}
            <span className="font-semibold text-foreground">
              {Math.round(current.feelslike_c)}°C
            </span>
          </p>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <WeatherDetail
            icon={<Droplets className="h-5 w-5 text-weather-cool" />}
            label="Humidity"
            value={`${current.humidity}%`}
          />
          <WeatherDetail
            icon={<Wind className="h-5 w-5 text-primary" />}
            label="Wind"
            value={`${Math.round(current.wind_kph)} km/h ${current.wind_dir}`}
          />
          <WeatherDetail
            icon={<Eye className="h-5 w-5 text-muted-foreground" />}
            label="Visibility"
            value={`${current.vis_km} km`}
          />
          <WeatherDetail
            icon={<Sun className="h-5 w-5 text-weather-warm" />}
            label="UV Index"
            value={current.uv.toString()}
          />
        </div>
      </div>
    </div>
  );
}

interface WeatherDetailProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function WeatherDetail({ icon, label, value }: WeatherDetailProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
