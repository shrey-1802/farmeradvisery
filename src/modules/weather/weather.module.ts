import { Module } from '@nestjs/common';
import { OpenMeteoWeatherProvider } from '../../providers/weather/open-meteo.provider';
import { WeatherCacheRepository } from './repositories/weather-cache.repository';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService, WeatherCacheRepository, OpenMeteoWeatherProvider],
  exports: [WeatherService, WeatherCacheRepository],
})
export class WeatherModule {}
