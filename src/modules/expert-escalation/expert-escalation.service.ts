import { Injectable, NotFoundException } from '@nestjs/common';
import { RespondEscalationDto } from './dto/respond-escalation.dto';
import { EscalationsRepository, IEscalationRecord } from './repositories/escalations.repository';

@Injectable()
export class ExpertEscalationService {
  constructor(private readonly escalationsRepo: EscalationsRepository) {}

  async createEscalation(queryId: number): Promise<IEscalationRecord> {
    return this.escalationsRepo.create(queryId);
  }

  async getEscalationsForOfficer(
    officerDistrictId?: number,
    status?: 'pending' | 'in_review' | 'resolved',
  ): Promise<IEscalationRecord[]> {
    return this.escalationsRepo.findByDistrict(officerDistrictId, status);
  }

  async respondToEscalation(
    escalationId: number,
    officerId: number,
    dto: RespondEscalationDto,
  ): Promise<IEscalationRecord> {
    const existing = await this.escalationsRepo.findById(escalationId);
    if (!existing) {
      throw new NotFoundException(`Escalation record ${escalationId} not found`);
    }

    const updated = await this.escalationsRepo.respond(
      escalationId,
      officerId,
      dto.officerResponse,
    );

    if (!updated) {
      throw new Error(`Failed to record officer response for escalation ${escalationId}`);
    }
    return updated;
  }
}
