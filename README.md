# Weather App

A modern, responsive weather application built with React and TypeScript that allows users to search for cities and view current weather conditions.

## Features

- **City Search with Autocomplete**: Start typing a city name and get real-time suggestions to quickly find your location
- **Current Weather Display**: View detailed weather information including:
  - Temperature (with feels-like temperature)
  - Weather condition with icon
  - Humidity percentage
  - Wind speed and direction
  - Visibility distance
  - UV index
- **Unit Toggle**: Switch between Fahrenheit/Imperial and Celsius/Metric units
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase Edge Functions (Lovable Cloud)
- **Weather Data**: WeatherAPI

## How It Works

1. Enter a city name in the search field
2. Select from autocomplete suggestions or press Enter
3. View the current weather conditions for the selected city
4. Use the toggle switch to change between Fahrenheit and Celsius

## Development

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

The app requires a weather API key configured in the backend. If deploying your own instance, you'll need to set up the appropriate environment variables for the edge function.

## License

This project is open source and available under the MIT License.
