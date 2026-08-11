import { Injectable, Logger } from '@nestjs/common';
import { FarmerProfilesService } from '../farmer-profiles/farmer-profiles.service';
import { FarmsService } from '../farms/farms.service';
import { WeatherService } from '../weather/weather.service';
import { GenerateAdvisoryDto } from './dto/generate-advisory.dto';
import { AdvisoryRuleEngine } from './engine/advisory-rule.engine';
import { AdvisoryQueriesRepository } from './repositories/advisory-queries.repository';

@Injectable()
export class AdvisoryService {
  private readonly logger = new Logger(AdvisoryService.name);

  constructor(
    private readonly farmsService: FarmsService,
    private readonly farmerProfilesService: FarmerProfilesService,
    private readonly weatherService: WeatherService,
    private readonly ruleEngine: AdvisoryRuleEngine,
    private readonly advisoryQueriesRepo: AdvisoryQueriesRepository,
  ) {}

  async generateAdvisory(farmerId: number, dto: GenerateAdvisoryDto) {
    // 1. Fetch farm profile and verify ownership
    const farm = await this.farmsService.getFarmById(dto.farmProfileId, farmerId);
    const farmer = await this.farmerProfilesService.getProfile(farmerId);

    const targetLang = (dto.language || farmer.preferredLanguage || 'en') as 'en' | 'hi' | 'gu';

    // 2. Fetch current & forecast weather for farm's district
    const currentWeather = await this.weatherService.getCurrentWeather(
      farm.districtId,
      farm.latitude ?? undefined,
      farm.longitude ?? undefined,
    );

    const forecastWeather = await this.weatherService.getForecastWeather(
      farm.districtId,
      farm.latitude ?? undefined,
      farm.longitude ?? undefined,
    );

    // 3. Execute Rule-Based Agronomic Engine
    const advisories = this.ruleEngine.generateAdvisory({
      farmProfile: farm,
      currentWeather,
      forecastWeather,
      language: targetLang,
    });

    // 4. Record query in advisory_queries database table
    const recordedQuery = await this.advisoryQueriesRepo.create({
      farmerId,
      profileId: farm.profileId,
      districtId: farm.districtId,
      queryType: 'weather',
      inputMode: 'text',
      aiResponse: JSON.stringify(advisories),
      status: 'resolved',
    });

    return {
      queryId: recordedQuery.queryId,
      farm: {
        profileId: farm.profileId,
        cropName: farm.cropName,
        districtName: farm.districtName,
        landSize: farm.landSize,
        landUnit: farm.landUnit,
      },
      currentWeather,
      advisories,
      generatedAt: new Date().toISOString(),
    };
  }

  async getHistory(farmerId: number) {
    return this.advisoryQueriesRepo.findByFarmerId(farmerId);
  }
}
