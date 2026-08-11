import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FarmerProfilesModule } from '../farmer-profiles/farmer-profiles.module';
import { FarmsModule } from '../farms/farms.module';
import { WeatherModule } from '../weather/weather.module';
import { AdvisoryController } from './advisory.controller';
import { AdvisoryService } from './advisory.service';
import { AdvisoryRuleEngine } from './engine/advisory-rule.engine';
import { AdvisoryQueriesRepository } from './repositories/advisory-queries.repository';

@Module({
  imports: [JwtModule, FarmsModule, FarmerProfilesModule, WeatherModule],
  controllers: [AdvisoryController],
  providers: [AdvisoryService, AdvisoryRuleEngine, AdvisoryQueriesRepository],
  exports: [AdvisoryService, AdvisoryRuleEngine, AdvisoryQueriesRepository],
})
export class AdvisoryModule {}
