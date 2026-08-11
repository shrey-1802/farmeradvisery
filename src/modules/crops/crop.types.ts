export interface ICrop {
  cropId: number;
  cropName: string;
  cropCategory: 'cereal' | 'pulse' | 'vegetable' | 'fruit' | 'cash_crop' | 'oilseed' | 'other';
}

export interface IDistrict {
  districtId: number;
  districtName: string;
  stateName: string;
}

export interface IFertilizerGuideline {
  guidelineId: number;
  cropId: number;
  landUnit: 'acre' | 'hectare' | 'bigha';
  fertilizerName: string;
  dosagePerUnit: number;
  dosageUnit: string;
  growthStage?: string;
  notes?: string;
}

export function mapRowToCrop(row: any): ICrop {
  return {
    cropId: Number(row.crop_id),
    cropName: row.crop_name,
    cropCategory: row.crop_category,
  };
}

export function mapRowToDistrict(row: any): IDistrict {
  return {
    districtId: Number(row.district_id),
    districtName: row.district_name,
    stateName: row.state_name,
  };
}

export function mapRowToFertilizerGuideline(row: any): IFertilizerGuideline {
  return {
    guidelineId: Number(row.guideline_id),
    cropId: Number(row.crop_id),
    landUnit: row.land_unit,
    fertilizerName: row.fertilizer_name,
    dosagePerUnit: Number(row.dosage_per_unit),
    dosageUnit: row.dosage_unit || 'kg',
    growthStage: row.growth_stage || undefined,
    notes: row.notes || undefined,
  };
}
