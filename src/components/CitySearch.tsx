import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface City {
  id: number;
  name: string;
  region: string;
  country: string;
  url: string;
}

interface CitySearchProps {
  onCitySelect: (city: string) => void;
  isLoading: boolean;
}

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export function CitySearch({ onCitySelect, isLoading }: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsFetching(true);
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsFetching(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setQuery(`${city.name}, ${city.country}`);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCity) {
      onCitySelect(selectedCity.name);
    } else if (query.trim()) {
      onCitySelect(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div ref={containerRef} className="relative">
        <div className="relative flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search for a city..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedCity(null);
              }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="pl-12 h-14 glass text-base rounded-xl border-0 placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/50"
            />
            {isFetching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
            )}
          </div>
          <Button
            type="submit"
            variant="weather"
            size="lg"
            disabled={isLoading || (!selectedCity && !query.trim())}
            className="h-14 px-6"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Get Weather"
            )}
          </Button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 glass rounded-xl overflow-hidden animate-fade-in">
            <ul className="py-2">
              {suggestions.map((city) => (
                <li key={city.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className={cn(
                      "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-secondary/50",
                      selectedCity?.id === city.id && "bg-secondary/70"
                    )}
                  >
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <span className="font-medium">{city.name}</span>
                      <span className="text-muted-foreground">
                        , {city.region && `${city.region}, `}{city.country}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </form>
  );
}
