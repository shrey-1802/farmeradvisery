export interface IFarmProfile {
  profileId: number;
  farmerId: number;
  districtId: number;
  districtName?: string;
  stateName?: string;
  latitude?: number | null;
  longitude?: number | null;
  landSize: number;
  landUnit: 'acre' | 'hectare' | 'bigha';
  cropId: number;
  cropName?: string;
  waterSource: 'canal' | 'tube_well' | 'both' | 'rainfed';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateFarmInput {
  farmerId: number;
  districtId: number;
  latitude?: number;
  longitude?: number;
  landSize: number;
  landUnit?: 'acre' | 'hectare' | 'bigha';
  cropId: number;
  waterSource: 'canal' | 'tube_well' | 'both' | 'rainfed';
}

export interface IUpdateFarmInput {
  districtId?: number;
  latitude?: number;
  longitude?: number;
  landSize?: number;
  landUnit?: 'acre' | 'hectare' | 'bigha';
  cropId?: number;
  waterSource?: 'canal' | 'tube_well' | 'both' | 'rainfed';
}

export function mapRowToFarmProfile(row: any): IFarmProfile {
  return {
    profileId: Number(row.profile_id),
    farmerId: Number(row.farmer_id),
    districtId: Number(row.district_id),
    districtName: row.district_name,
    stateName: row.state_name,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    landSize: Number(row.land_size),
    landUnit: row.land_unit,
    cropId: Number(row.crop_id),
    cropName: row.crop_name,
    waterSource: row.water_source,
    isActive: Boolean(row.is_active),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
