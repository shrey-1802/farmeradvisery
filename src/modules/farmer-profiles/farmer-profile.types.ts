export interface IFarmer {
  farmerId: number;
  phoneNumber: string;
  name: string | null;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateFarmerInput {
  phoneNumber: string;
  name?: string;
  preferredLanguage?: string;
}

export interface IUpdateFarmerInput {
  name?: string;
  preferredLanguage?: string;
}

export function mapRowToFarmer(row: any): IFarmer {
  return {
    farmerId: Number(row.farmer_id),
    phoneNumber: row.phone_number,
    name: row.name || null,
    preferredLanguage: row.preferred_language || 'en',
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
