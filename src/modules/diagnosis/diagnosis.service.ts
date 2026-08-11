import { Injectable, Logger } from '@nestjs/common';
import { MockCropDiagnosisProvider } from '../../providers/diagnosis/mock-crop-diagnosis.provider';
import { LocalStorageProvider } from '../../providers/storage/local-storage.provider';
import { AdvisoryQueriesRepository } from '../advisory/repositories/advisory-queries.repository';
import { ExpertEscalationService } from '../expert-escalation/expert-escalation.service';
import { FarmsService } from '../farms/farms.service';

@Injectable()
export class DiagnosisService {
  private readonly logger = new Logger(DiagnosisService.name);

  constructor(
    private readonly storageProvider: LocalStorageProvider,
    private readonly diagnosisProvider: MockCropDiagnosisProvider,
    private readonly advisoryQueriesRepo: AdvisoryQueriesRepository,
    private readonly escalationService: ExpertEscalationService,
    private readonly farmsService: FarmsService,
  ) {}

  async processCropImageUpload(
    farmerId: number,
    file: any,
    farmProfileId?: number,
  ) {
    let cropName = 'Crop';
    let districtId: number | undefined;

    if (farmProfileId) {
      const farm = await this.farmsService.getFarmById(farmProfileId, farmerId);
      cropName = farm.cropName || 'Crop';
      districtId = farm.districtId;
    }

    // 1. Upload & store file privately in uploads/crop-images/
    const { fileUrl, filePath } = await this.storageProvider.uploadFile(file, 'crop-images');

    // 2. Create pending query log
    const query = await this.advisoryQueriesRepo.create({
      farmerId,
      profileId: farmProfileId,
      districtId,
      queryType: 'pest_disease',
      inputMode: 'photo',
      photoUrl: fileUrl,
      status: 'pending',
    });

    // 3. Execute AI Vision Diagnosis
    const aiResult = await this.diagnosisProvider.diagnoseCropImage(filePath, cropName);
    const confidence = aiResult.confidenceScore;

    let finalStatus: 'resolved' | 'escalated' = 'resolved';
    let escalationRecord = null;
    let confidenceCategory = 'HIGH_CONFIDENCE';
    let adviceDisclaimer =
      'This AI diagnosis is for decision-support only. Do not apply high chemical doses without verifying symptoms.';

    if (confidence >= 0.85) {
      confidenceCategory = 'HIGH_CONFIDENCE';
    } else if (confidence >= 0.60) {
      confidenceCategory = 'MEDIUM_CONFIDENCE';
      adviceDisclaimer =
        'Possible diagnosis match. Please inspect closely or upload a clearer close-up photo of the affected leaf/stem.';
    } else {
      // Confidence < 0.60: Auto-escalate to expert field officer!
      confidenceCategory = 'LOW_CONFIDENCE_ESCALATED';
      finalStatus = 'escalated';
      escalationRecord = await this.escalationService.createEscalation(query.queryId);
      adviceDisclaimer =
        'Diagnosis is uncertain (<60% confidence). Your case has been automatically escalated to a registered field officer for manual review.';
    }

    // 4. Update query record in database
    await this.advisoryQueriesRepo.updateStatus(
      query.queryId,
      finalStatus,
      JSON.stringify(aiResult),
      confidence,
    );

    return {
      queryId: query.queryId,
      photoUrl: fileUrl,
      diagnosis: {
        diseaseName: aiResult.diseaseName,
        category: aiResult.category,
        confidenceScore: confidence,
        confidenceCategory,
        standardRemedy: aiResult.standardRemedy,
        isEscalated: finalStatus === 'escalated',
        escalationId: escalationRecord?.escalationId || null,
        disclaimer: adviceDisclaimer,
      },
      createdAt: new Date().toISOString(),
    };
  }

  async getDiagnosisStatus(queryId: number) {
    return this.advisoryQueriesRepo.findById(queryId);
  }
}
