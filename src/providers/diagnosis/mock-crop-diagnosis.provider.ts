import { Injectable, Logger } from '@nestjs/common';
import {
  ICropDiagnosisProvider,
  IDiagnosisResult,
} from './diagnosis-provider.interface';

@Injectable()
export class MockCropDiagnosisProvider implements ICropDiagnosisProvider {
  private readonly logger = new Logger(MockCropDiagnosisProvider.name);

  async diagnoseCropImage(imagePath: string, cropName?: string): Promise<IDiagnosisResult> {
    this.logger.log(`Running AI vision analysis on image ${imagePath} for crop [${cropName || 'General'}]`);

    // Simulated diagnosis results matching seed pest database (Pink Bollworm, Late Blight, Aphid Infestation)
    const normalizedCrop = (cropName || '').toLowerCase();

    if (normalizedCrop.includes('cotton')) {
      return {
        diseaseName: 'Pink Bollworm Infestation',
        confidenceScore: 0.88,
        category: 'pest',
        detectedPestId: 1,
        standardRemedy:
          'Install pheromone traps (5 traps per acre); spray recommended organic or eco-friendly neem-based solution at initial sighting.',
        isUncertain: false,
      };
    } else if (normalizedCrop.includes('tomato')) {
      return {
        diseaseName: 'Late Blight Fungal Infection',
        confidenceScore: 0.75,
        category: 'disease',
        detectedPestId: 2,
        standardRemedy:
          'Apply copper-based fungicide spray; ensure clean field drainage and avoid overhead sprinkler irrigation.',
        isUncertain: false,
      };
    }

    // Default simulation case with lower confidence score to test human officer escalation
    return {
      diseaseName: 'Unconfirmed Leaf Yellowing / Aphid Symptoms',
      confidenceScore: 0.55, // < 0.60 triggers automatic expert escalation
      category: 'pest',
      detectedPestId: 3,
      standardRemedy:
        'Symptom is ambiguous. This image requires field review by an expert agricultural officer.',
      isUncertain: true,
    };
  }
}
