import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { AdvisoryModule } from './modules/advisory/advisory.module';
import { AuthModule } from './modules/auth/auth.module';
import { CropsModule } from './modules/crops/crops.module';
import { DiagnosisModule } from './modules/diagnosis/diagnosis.module';
import { ExpertEscalationModule } from './modules/expert-escalation/expert-escalation.module';
import { FarmerProfilesModule } from './modules/farmer-profiles/farmer-profiles.module';
import { FarmsModule } from './modules/farms/farms.module';
import { HealthModule } from './modules/health/health.module';
import { ReportsModule } from './modules/reports/reports.module';
import { WeatherModule } from './modules/weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    FarmerProfilesModule,
    FarmsModule,
    CropsModule,
    WeatherModule,
    AdvisoryModule,
    DiagnosisModule,
    ExpertEscalationModule,
    ReportsModule,
  ],
})
export class AppModule {}
