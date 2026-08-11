export interface IDiagnosisResult {
  diseaseName: string;
  confidenceScore: number; // 0.00 to 1.00
  category: 'pest' | 'disease' | 'deficiency';
  detectedPestId?: number;
  standardRemedy: string;
  isUncertain: boolean;
}

export interface ICropDiagnosisProvider {
  diagnoseCropImage(imagePath: string, cropName?: string): Promise<IDiagnosisResult>;
}
