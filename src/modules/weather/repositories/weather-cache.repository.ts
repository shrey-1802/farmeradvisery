import { Injectable, Logger } from '@nestjs/common';
import { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../database/database.service';

export interface IWeatherCacheRecord {
  cacheId: number;
  districtId: number;
  weatherDate: string;
  temperatureC: number | null;
  humidityPct: number | null;
  rainfallMm: number | null;
  windSpeedKmh: number | null;
  rawData: any;
  fetchedAt: Date;
}

@Injectable()
export class WeatherCacheRepository {
  private readonly logger = new Logger(WeatherCacheRepository.name);

  constructor(private readonly database: DatabaseService) {}

  async findCache(districtId: number, weatherDate: string): Promise<IWeatherCacheRecord | null> {
    const rows = await this.database.query<RowDataPacket[]>(
      `
        SELECT 
          cache_id, district_id, weather_date, temperature_c, humidity_pct,
          rainfall_mm, wind_speed_kmh, raw_data, fetched_at
        FROM weather_cache
        WHERE district_id = ? AND weather_date = ?
        LIMIT 1
      `,
      [districtId, weatherDate],
    );

    if (!rows || rows.length === 0) {
      return null;
    }
    const r = rows[0];
    return {
      cacheId: Number(r.cache_id),
      districtId: Number(r.district_id),
      weatherDate: r.weather_date,
      temperatureC: r.temperature_c !== null ? Number(r.temperature_c) : null,
      humidityPct: r.humidity_pct !== null ? Number(r.humidity_pct) : null,
      rainfallMm: r.rainfall_mm !== null ? Number(r.rainfall_mm) : null,
      windSpeedKmh: r.wind_speed_kmh !== null ? Number(r.wind_speed_kmh) : null,
      rawData: typeof r.raw_data === 'string' ? JSON.parse(r.raw_data) : r.raw_data,
      fetchedAt: new Date(r.fetched_at),
    };
  }

  async findLatestCacheForDistrict(districtId: number): Promise<IWeatherCacheRecord | null> {
    const rows = await this.database.query<RowDataPacket[]>(
      `
        SELECT 
          cache_id, district_id, weather_date, temperature_c, humidity_pct,
          rainfall_mm, wind_speed_kmh, raw_data, fetched_at
        FROM weather_cache
        WHERE district_id = ?
        ORDER BY fetched_at DESC
        LIMIT 1
      `,
      [districtId],
    );

    if (!rows || rows.length === 0) {
      return null;
    }
    const r = rows[0];
    return {
      cacheId: Number(r.cache_id),
      districtId: Number(r.district_id),
      weatherDate: r.weather_date,
      temperatureC: r.temperature_c !== null ? Number(r.temperature_c) : null,
      humidityPct: r.humidity_pct !== null ? Number(r.humidity_pct) : null,
      rainfallMm: r.rainfall_mm !== null ? Number(r.rainfall_mm) : null,
      windSpeedKmh: r.wind_speed_kmh !== null ? Number(r.wind_speed_kmh) : null,
      rawData: typeof r.raw_data === 'string' ? JSON.parse(r.raw_data) : r.raw_data,
      fetchedAt: new Date(r.fetched_at),
    };
  }

  async upsertCache(
    districtId: number,
    weatherDate: string,
    data: {
      temperatureC?: number;
      humidityPct?: number;
      rainfallMm?: number;
      windSpeedKmh?: number;
      rawData?: any;
    },
  ): Promise<void> {
    const jsonStr = data.rawData ? JSON.stringify(data.rawData) : null;
    await this.database.execute(
      `
        INSERT INTO weather_cache 
          (district_id, weather_date, temperature_c, humidity_pct, rainfall_mm, wind_speed_kmh, raw_data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          temperature_c = VALUES(temperature_c),
          humidity_pct = VALUES(humidity_pct),
          rainfall_mm = VALUES(rainfall_mm),
          wind_speed_kmh = VALUES(wind_speed_kmh),
          raw_data = VALUES(raw_data),
          fetched_at = CURRENT_TIMESTAMP
      `,
      [
        districtId,
        weatherDate,
        data.temperatureC ?? null,
        data.humidityPct ?? null,
        data.rainfallMm ?? null,
        data.windSpeedKmh ?? null,
        jsonStr,
      ],
    );
  }
}
