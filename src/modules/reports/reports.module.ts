import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WhatsAppNotificationProvider } from '../../providers/notifications/whatsapp.provider';
import { AdvisoryModule } from '../advisory/advisory.module';
import { FarmerProfilesModule } from '../farmer-profiles/farmer-profiles.module';
import { ReportsRepository } from './repositories/reports.repository';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [JwtModule, FarmerProfilesModule, AdvisoryModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsRepository, WhatsAppNotificationProvider],
  exports: [ReportsService],
})
export class ReportsModule {}
