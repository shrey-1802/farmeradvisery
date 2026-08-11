import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ExpertEscalationController } from './expert-escalation.controller';
import { ExpertEscalationService } from './expert-escalation.service';
import { EscalationsRepository } from './repositories/escalations.repository';

@Module({
  imports: [JwtModule],
  controllers: [ExpertEscalationController],
  providers: [ExpertEscalationService, EscalationsRepository],
  exports: [ExpertEscalationService, EscalationsRepository],
})
export class ExpertEscalationModule {}
