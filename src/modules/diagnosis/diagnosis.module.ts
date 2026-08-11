import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MockCropDiagnosisProvider } from '../../providers/diagnosis/mock-crop-diagnosis.provider';
import { LocalStorageProvider } from '../../providers/storage/local-storage.provider';
import { AdvisoryModule } from '../advisory/advisory.module';
import { ExpertEscalationModule } from '../expert-escalation/expert-escalation.module';
import { FarmsModule } from '../farms/farms.module';
import { DiagnosisController } from './diagnosis.controller';
import { DiagnosisService } from './diagnosis.service';

@Module({
  imports: [JwtModule, AdvisoryModule, ExpertEscalationModule, FarmsModule],
  controllers: [DiagnosisController],
  providers: [
    DiagnosisService,
    LocalStorageProvider,
    MockCropDiagnosisProvider,
  ],
  exports: [DiagnosisService],
})
export class DiagnosisModule {}
