import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define allowed origins for CORS - restrict to your app's domains
const ALLOWED_ORIGINS = [
  'https://qlubcsbwtcqnbcvgcyfm.lovableproject.com',
  'https://lovable.dev',
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
];

const WEATHER_API_KEY = Deno.env.get('WEATHER_API_KEY');

// Helper to get CORS headers based on request origin
const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app') || origin.endsWith('.lovableproject.com')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
};

// Validate query input - only allow safe characters for city/location queries
const validateQuery = (query: string): { valid: boolean; error?: string } => {
  // Check length
  if (query.length < 2) {
    return { valid: false, error: 'Query must be at least 2 characters' };
  }
  if (query.length > 100) {
    return { valid: false, error: 'Query must be less than 100 characters' };
  }
  
  // Allow letters, numbers, spaces, commas, periods, hyphens, and common diacritics
  const validPattern = /^[\p{L}\p{N}\s,.\-']+$/u;
  if (!validPattern.test(query)) {
    return { valid: false, error: 'Query contains invalid characters' };
  }
  
  return { valid: true };
};

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const query = url.searchParams.get('q');

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter "q" is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the query input
    const validation = validateQuery(query);
    if (!validation.valid) {
      console.warn('Invalid query rejected:', query.substring(0, 50));
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!WEATHER_API_KEY) {
      console.error('WEATHER_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Weather API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let apiUrl: string;

    if (action === 'search') {
      // City search/autocomplete
      apiUrl = `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`;
      console.log('Searching cities for:', query);
    } else {
      // Current weather
      apiUrl = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`;
      console.log('Fetching weather for:', query);
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('WeatherAPI error:', data);
      return new Response(
        JSON.stringify({ error: data.error?.message || 'Failed to fetch weather data' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully fetched data');
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in weather function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
