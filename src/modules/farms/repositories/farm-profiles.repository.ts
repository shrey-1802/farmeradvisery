import { Injectable, Logger } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../database/database.service';
import {
  ICreateFarmInput,
  IFarmProfile,
  IUpdateFarmInput,
  mapRowToFarmProfile,
} from '../farm.types';

@Injectable()
export class FarmProfilesRepository {
  private readonly logger = new Logger(FarmProfilesRepository.name);

  constructor(private readonly database: DatabaseService) {}

  async findByFarmerId(farmerId: number): Promise<IFarmProfile[]> {
    const rows = await this.database.query<RowDataPacket[]>(
      `
        SELECT 
          fp.profile_id, fp.farmer_id, fp.district_id, d.district_name, d.state_name,
          fp.latitude, fp.longitude, fp.land_size, fp.land_unit, fp.crop_id, c.crop_name,
          fp.water_source, fp.is_active, fp.created_at, fp.updated_at
        FROM farm_profiles fp
        JOIN districts d ON fp.district_id = d.district_id
        JOIN crops c ON fp.crop_id = c.crop_id
        WHERE fp.farmer_id = ? AND fp.is_active = TRUE
        ORDER BY fp.created_at DESC
      `,
      [farmerId],
    );

    return rows.map(mapRowToFarmProfile);
  }

  async findById(profileId: number, farmerId?: number): Promise<IFarmProfile | null> {
    let sql = `
      SELECT 
        fp.profile_id, fp.farmer_id, fp.district_id, d.district_name, d.state_name,
        fp.latitude, fp.longitude, fp.land_size, fp.land_unit, fp.crop_id, c.crop_name,
        fp.water_source, fp.is_active, fp.created_at, fp.updated_at
      FROM farm_profiles fp
      JOIN districts d ON fp.district_id = d.district_id
      JOIN crops c ON fp.crop_id = c.crop_id
      WHERE fp.profile_id = ? AND fp.is_active = TRUE
    `;

    const params: any[] = [profileId];
    if (farmerId !== undefined) {
      sql += ` AND fp.farmer_id = ?`;
      params.push(farmerId);
    }
    sql += ` LIMIT 1`;

    const rows = await this.database.query<RowDataPacket[]>(sql, params);
    if (!rows || rows.length === 0) {
      return null;
    }
    return mapRowToFarmProfile(rows[0]);
  }

  async create(input: ICreateFarmInput): Promise<IFarmProfile> {
    const landUnit = input.landUnit || 'acre';
    const result: ResultSetHeader = await this.database.execute(
      `
        INSERT INTO farm_profiles 
          (farmer_id, district_id, latitude, longitude, land_size, land_unit, crop_id, water_source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.farmerId,
        input.districtId,
        input.latitude || null,
        input.longitude || null,
        input.landSize,
        landUnit,
        input.cropId,
        input.waterSource,
      ],
    );

    const newId = result.insertId;
    const created = await this.findById(newId, input.farmerId);
    if (!created) {
      throw new Error(`Failed to fetch created farm profile ID ${newId}`);
    }
    return created;
  }

  async update(
    profileId: number,
    farmerId: number,
    input: IUpdateFarmInput,
  ): Promise<IFarmProfile | null> {
    await this.database.execute(
      `
        UPDATE farm_profiles
        SET 
          district_id = COALESCE(?, district_id),
          latitude = COALESCE(?, latitude),
          longitude = COALESCE(?, longitude),
          land_size = COALESCE(?, land_size),
          land_unit = COALESCE(?, land_unit),
          crop_id = COALESCE(?, crop_id),
          water_source = COALESCE(?, water_source),
          updated_at = CURRENT_TIMESTAMP
        WHERE profile_id = ? AND farmer_id = ? AND is_active = TRUE
      `,
      [
        input.districtId || null,
        input.latitude || null,
        input.longitude || null,
        input.landSize || null,
        input.landUnit || null,
        input.cropId || null,
        input.waterSource || null,
        profileId,
        farmerId,
      ],
    );

    return this.findById(profileId, farmerId);
  }

  async delete(profileId: number, farmerId: number): Promise<boolean> {
    const result = await this.database.execute(
      `
        UPDATE farm_profiles
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE profile_id = ? AND farmer_id = ?
      `,
      [profileId, farmerId],
    );
    return result.affectedRows > 0;
  }
}
