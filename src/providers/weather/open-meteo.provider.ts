import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ICurrentWeatherData,
  IForecastWeatherData,
  IWeatherProvider,
} from './weather-provider.interface';

@Injectable()
export class OpenMeteoWeatherProvider implements IWeatherProvider {
  private readonly logger = new Logger(OpenMeteoWeatherProvider.name);
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'WEATHER_BASE_URL',
      'https://api.open-meteo.com/v1',
    );
  }

  async getCurrentWeather(latitude: number, longitude: number): Promise<ICurrentWeatherData> {
    try {
      const url = `${this.baseUrl}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m`;
      const response = await this.fetchWithTimeout(url, 5000);
      const data = await response.json();

      if (!data || !data.current) {
        throw new Error('Malformed response from Open-Meteo API');
      }

      const current = data.current;
      return {
        temperatureC: Number(current.temperature_2m || 0),
        humidityPct: Number(current.relative_humidity_2m || 0),
        rainfallMm: Number(current.rain || 0),
        windSpeedKmh: Number(current.wind_speed_10m || 0),
        weatherCondition: this.deriveWeatherCondition(current.rain, current.temperature_2m),
        fetchedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch current weather for (${latitude}, ${longitude}): ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getForecastWeather(latitude: number, longitude: number): Promise<IForecastWeatherData> {
    try {
      const url = `${this.baseUrl}/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&forecast_days=7`;
      const response = await this.fetchWithTimeout(url, 5000);
      const data = await response.json();

      if (!data || !data.daily || !data.daily.time) {
        throw new Error('Malformed daily forecast response from Open-Meteo API');
      }

      const daily = data.daily;
      const forecastDays = daily.time.map((dateStr: string, idx: number) => ({
        date: dateStr,
        maxTempC: Number(daily.temperature_2m_max[idx] || 0),
        minTempC: Number(daily.temperature_2m_min[idx] || 0),
        precipitationMm: Number(daily.precipitation_sum[idx] || 0),
        maxWindSpeedKmh: Number(daily.wind_speed_10m_max[idx] || 0),
      }));

      return {
        latitude,
        longitude,
        dailyForecast: forecastDays,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch forecast weather for (${latitude}, ${longitude}): ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private deriveWeatherCondition(rainMm: number, tempC: number): string {
    if (rainMm > 5) return 'Heavy Rain';
    if (rainMm > 0.5) return 'Light Rain';
    if (tempC > 38) return 'Hot & Sunny';
    if (tempC < 15) return 'Cool';
    return 'Partly Cloudy';
  }
}
