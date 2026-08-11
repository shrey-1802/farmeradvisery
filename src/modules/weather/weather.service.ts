import { Injectable, Logger } from '@nestjs/common';
import { OpenMeteoWeatherProvider } from '../../providers/weather/open-meteo.provider';
import {
  ICurrentWeatherData,
  IForecastWeatherData,
} from '../../providers/weather/weather-provider.interface';
import { WeatherCacheRepository } from './repositories/weather-cache.repository';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    private readonly weatherProvider: OpenMeteoWeatherProvider,
    private readonly weatherCacheRepo: WeatherCacheRepository,
  ) {}

  async getCurrentWeather(
    districtId: number,
    latitude?: number,
    longitude?: number,
  ): Promise<ICurrentWeatherData> {
    const todayStr = new Date().toISOString().split('T')[0];

    // Check DB cache first
    const cached = await this.weatherCacheRepo.findCache(districtId, todayStr);
    const oneHourAgo = new Date(Date.now() - 3600 * 1000);

    if (cached && cached.fetchedAt > oneHourAgo && cached.temperatureC !== null) {
      this.logger.log(`Serving weather for district ${districtId} from DB cache`);
      return {
        temperatureC: cached.temperatureC,
        humidityPct: cached.humidityPct || 0,
        rainfallMm: cached.rainfallMm || 0,
        windSpeedKmh: cached.windSpeedKmh || 0,
        weatherCondition: this.deriveWeatherCondition(cached.rainfallMm || 0, cached.temperatureC),
        fetchedAt: cached.fetchedAt,
      };
    }

    // Default coordinates if not provided (Gujarat center region)
    const lat = latitude ?? 23.0225;
    const lng = longitude ?? 72.5714;

    try {
      const freshWeather = await this.weatherProvider.getCurrentWeather(lat, lng);

      // Async cache save
      await this.weatherCacheRepo.upsertCache(districtId, todayStr, {
        temperatureC: freshWeather.temperatureC,
        humidityPct: freshWeather.humidityPct,
        rainfallMm: freshWeather.rainfallMm,
        windSpeedKmh: freshWeather.windSpeedKmh,
        rawData: freshWeather,
      });

      return freshWeather;
    } catch (error) {
      this.logger.warn(
        `Open-Meteo call failed. Attempting fallback to stale DB cache for district ${districtId}`,
      );
      const fallback = await this.weatherCacheRepo.findLatestCacheForDistrict(districtId);
      if (fallback && fallback.temperatureC !== null) {
        return {
          temperatureC: fallback.temperatureC,
          humidityPct: fallback.humidityPct || 0,
          rainfallMm: fallback.rainfallMm || 0,
          windSpeedKmh: fallback.windSpeedKmh || 0,
          weatherCondition: this.deriveWeatherCondition(
            fallback.rainfallMm || 0,
            fallback.temperatureC,
          ),
          fetchedAt: fallback.fetchedAt,
        };
      }
      throw error;
    }
  }

  async getForecastWeather(
    districtId: number,
    latitude?: number,
    longitude?: number,
  ): Promise<IForecastWeatherData> {
    const lat = latitude ?? 23.0225;
    const lng = longitude ?? 72.5714;
    const forecast = await this.weatherProvider.getForecastWeather(lat, lng);
    return {
      ...forecast,
      districtId,
    };
  }

  private deriveWeatherCondition(rainMm: number, tempC: number): string {
    if (rainMm > 5) return 'Heavy Rain';
    if (rainMm > 0.5) return 'Light Rain';
    if (tempC > 38) return 'Hot & Sunny';
    if (tempC < 15) return 'Cool';
    return 'Partly Cloudy';
  }
}
