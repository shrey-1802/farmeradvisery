import { ICurrentWeatherData, IForecastWeatherData } from '../../../providers/weather/weather-provider.interface';
import { IFarmProfile } from '../../farms/farm.types';

export interface IAdvisoryInput {
  farmProfile: IFarmProfile;
  currentWeather: ICurrentWeatherData;
  forecastWeather?: IForecastWeatherData;
  language?: 'en' | 'hi' | 'gu';
}

export interface IAdvisoryOutput {
  type: string;
  title: string;
  message: string;
  language: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedActions: string[];
  actionsToAvoid: string[];
  reason: string;
  validity: string;
  source: string;
  disclaimer: string;
}
