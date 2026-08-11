import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WeatherService } from './weather.service';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current weather for a district (cached or live)' })
  @ApiQuery({ name: 'districtId', required: true, example: 1 })
  @ApiQuery({ name: 'lat', required: false, example: 23.0225 })
  @ApiQuery({ name: 'lng', required: false, example: 72.5714 })
  @ApiResponse({ status: 200, description: 'Current weather data retrieved' })
  async getCurrentWeather(
    @Query('districtId') districtId: number,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
  ) {
    return this.weatherService.getCurrentWeather(
      Number(districtId),
      lat ? Number(lat) : undefined,
      lng ? Number(lng) : undefined,
    );
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Get 7-day weather forecast for a district' })
  @ApiQuery({ name: 'districtId', required: true, example: 1 })
  @ApiQuery({ name: 'lat', required: false, example: 23.0225 })
  @ApiQuery({ name: 'lng', required: false, example: 72.5714 })
  @ApiResponse({ status: 200, description: 'Forecast weather data retrieved' })
  async getForecastWeather(
    @Query('districtId') districtId: number,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
  ) {
    return this.weatherService.getForecastWeather(
      Number(districtId),
      lat ? Number(lat) : undefined,
      lng ? Number(lng) : undefined,
    );
  }
}
