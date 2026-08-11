import { Injectable, Logger } from '@nestjs/common';
import { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../database/database.service';
import {
  ICrop,
  IDistrict,
  IFertilizerGuideline,
  mapRowToCrop,
  mapRowToDistrict,
  mapRowToFertilizerGuideline,
} from '../crop.types';

@Injectable()
export class CropsRepository {
  private readonly logger = new Logger(CropsRepository.name);

  constructor(private readonly database: DatabaseService) {}

  async findAllCrops(): Promise<ICrop[]> {
    const rows = await this.database.query<RowDataPacket[]>(
      `
        SELECT crop_id, crop_name, crop_category
        FROM crops
        ORDER BY crop_name ASC
      `,
    );
    return rows.map(mapRowToCrop);
  }

  async findCropById(cropId: number): Promise<ICrop | null> {
    const rows = await this.database.query<RowDataPacket[]>(
      `
        SELECT crop_id, crop_name, crop_category
        FROM crops
        WHERE crop_id = ?
        LIMIT 1
      `,
      [cropId],
    );
    if (!rows || rows.length === 0) {
      return null;
    }
    return mapRowToCrop(rows[0]);
  }

  async findAllDistricts(): Promise<IDistrict[]> {
    const rows = await this.database.query<RowDataPacket[]>(
      `
        SELECT district_id, district_name, state_name
        FROM districts
        ORDER BY state_name ASC, district_name ASC
      `,
    );
    return rows.map(mapRowToDistrict);
  }

  async findFertilizerGuidelines(cropId: number): Promise<IFertilizerGuideline[]> {
    const rows = await this.database.query<RowDataPacket[]>(
      `
        SELECT guideline_id, crop_id, land_unit, fertilizer_name, dosage_per_unit, dosage_unit, growth_stage, notes
        FROM fertilizer_guidelines
        WHERE crop_id = ?
        ORDER BY guideline_id ASC
      `,
      [cropId],
    );
    return rows.map(mapRowToFertilizerGuideline);
  }
}
