import { AdvisoryRuleEngine } from './advisory-rule.engine';
import { IAdvisoryInput } from './advisory.types';

describe('AdvisoryRuleEngine', () => {
  let engine: AdvisoryRuleEngine;

  beforeEach(() => {
    engine = new AdvisoryRuleEngine();
  });

  const mockInput: IAdvisoryInput = {
    farmProfile: {
      profileId: 1,
      farmerId: 10,
      districtId: 2,
      landSize: 2,
      landUnit: 'acre',
      cropId: 1,
      cropName: 'Wheat',
      waterSource: 'canal',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    currentWeather: {
      temperatureC: 28,
      humidityPct: 50,
      rainfallMm: 0,
      windSpeedKmh: 10,
      weatherCondition: 'Clear',
      fetchedAt: new Date(),
    },
  };

  it('should generate general advisory when weather is normal', () => {
    const result = engine.generateAdvisory(mockInput);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].type).toBe('general_advisory');
    expect(result[0].severity).toBe('LOW');
  });

  it('should trigger Heavy Rainfall Alert when rain > 15mm', () => {
    const heavyRainInput: IAdvisoryInput = {
      ...mockInput,
      currentWeather: {
        ...mockInput.currentWeather,
        rainfallMm: 45,
      },
    };

    const result = engine.generateAdvisory(heavyRainInput);
    const rainAlert = result.find((r) => r.type === 'weather_alert');
    expect(rainAlert).toBeDefined();
    expect(rainAlert?.severity).toBe('HIGH');
    expect(rainAlert?.recommendedActions[0]).toContain('drainage');
  });

  it('should trigger Heat Stress Advisory when temp > 37°C', () => {
    const heatInput: IAdvisoryInput = {
      ...mockInput,
      currentWeather: {
        ...mockInput.currentWeather,
        temperatureC: 40,
      },
    };

    const result = engine.generateAdvisory(heatInput);
    const heatAlert = result.find((r) => r.type === 'heat_stress');
    expect(heatAlert).toBeDefined();
    expect(heatAlert?.severity).toBe('MEDIUM');
  });
});
