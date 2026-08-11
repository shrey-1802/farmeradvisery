export interface ICurrentWeatherData {
  temperatureC: number;
  humidityPct: number;
  rainfallMm: number;
  windSpeedKmh: number;
  weatherCondition: string;
  fetchedAt: Date;
}

export interface IForecastDayData {
  date: string;
  maxTempC: number;
  minTempC: number;
  precipitationMm: number;
  maxWindSpeedKmh: number;
}

export interface IForecastWeatherData {
  districtId?: number;
  latitude: number;
  longitude: number;
  dailyForecast: IForecastDayData[];
}

export interface IWeatherProvider {
  getCurrentWeather(latitude: number, longitude: number): Promise<ICurrentWeatherData>;
  getForecastWeather(latitude: number, longitude: number): Promise<IForecastWeatherData>;
}
