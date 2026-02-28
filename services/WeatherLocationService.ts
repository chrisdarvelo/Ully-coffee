import * as Location from 'expo-location';

export interface WeatherContext {
  city: string;
  region: string;
  country: string;
  tempC: string;
  tempF: string;
  feelsLikeC: string;
  feelsLikeF: string;
  condition: string;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
let cache: { data: WeatherContext; fetchedAt: number } | null = null;

/**
 * Requests location permission, fetches coordinates, then pulls weather from
 * wttr.in (free, no API key required). Caches the result for 30 minutes.
 * Returns null silently if permission is denied or any step fails.
 */
export async function getWeatherAndLocation(): Promise<WeatherContext | null> {
  // Return cached data if still fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low, // city-level is enough
    });
    const { latitude, longitude } = location.coords;

    const fetchPromise = fetch(
      `https://wttr.in/${latitude},${longitude}?format=j1`,
      { headers: { Accept: 'application/json' } }
    );
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('weather fetch timeout')), 5000)
    );
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    if (!response.ok) return null;

    const data = await response.json();
    const current = data.current_condition?.[0];
    const area = data.nearest_area?.[0];
    if (!current || !area) return null;

    const result: WeatherContext = {
      city: area.areaName?.[0]?.value || '',
      region: area.region?.[0]?.value || '',
      country: area.country?.[0]?.value || '',
      tempC: current.temp_C,
      tempF: current.temp_F,
      feelsLikeC: current.FeelsLikeC,
      feelsLikeF: current.FeelsLikeF,
      condition: current.weatherDesc?.[0]?.value || '',
    };

    cache = { data: result, fetchedAt: Date.now() };
    return result;
  } catch {
    return null;
  }
}
