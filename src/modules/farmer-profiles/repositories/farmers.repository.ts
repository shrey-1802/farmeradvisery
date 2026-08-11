import { Injectable, Logger } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../database/database.service';
import {
  ICreateFarmerInput,
  IFarmer,
  IUpdateFarmerInput,
  mapRowToFarmer,
} from '../farmer-profile.types';

@Injectable()
export class FarmersRepository {
  private readonly logger = new Logger(FarmersRepository.name);

  constructor(private readonly database: DatabaseService) {}

  async findByPhone(phoneNumber: string): Promise<IFarmer | null> {
    const rows = await this.database.query<RowDataPacket[]>(
      `
        SELECT 
          farmer_id, phone_number, name, preferred_language, created_at, updated_at
        FROM farmers
        WHERE phone_number = ?
        LIMIT 1
      `,
      [phoneNumber],
    );

    if (!rows || rows.length === 0) {
      return null;
    }
    return mapRowToFarmer(rows[0]);
  }

  async findById(farmerId: number): Promise<IFarmer | null> {
    const rows = await this.database.query<RowDataPacket[]>(
      `
        SELECT 
          farmer_id, phone_number, name, preferred_language, created_at, updated_at
        FROM farmers
        WHERE farmer_id = ?
        LIMIT 1
      `,
      [farmerId],
    );

    if (!rows || rows.length === 0) {
      return null;
    }
    return mapRowToFarmer(rows[0]);
  }

  async create(input: ICreateFarmerInput): Promise<IFarmer> {
    const preferredLanguage = input.preferredLanguage || 'en';
    const result: ResultSetHeader = await this.database.execute(
      `
        INSERT INTO farmers (phone_number, name, preferred_language)
        VALUES (?, ?, ?)
      `,
      [input.phoneNumber, input.name || null, preferredLanguage],
    );

    const newId = result.insertId;
    const created = await this.findById(newId);
    if (!created) {
      throw new Error(`Failed to retrieve newly created farmer record for ID ${newId}`);
    }
    return created;
  }

  async update(farmerId: number, input: IUpdateFarmerInput): Promise<IFarmer | null> {
    await this.database.execute(
      `
        UPDATE farmers
        SET 
          name = COALESCE(?, name),
          preferred_language = COALESCE(?, preferred_language),
          updated_at = CURRENT_TIMESTAMP
        WHERE farmer_id = ?
      `,
      [input.name || null, input.preferredLanguage || null, farmerId],
    );

    return this.findById(farmerId);
  }
}
