import { Injectable, Logger } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../database/database.service';

export interface IAdvisoryQueryRecord {
  queryId: number;
  farmerId: number;
  profileId: number | null;
  districtId: number | null;
  queryType: 'pest_disease' | 'weather' | 'general';
  inputMode: 'text' | 'voice' | 'photo';
  photoUrl?: string | null;
  audioUrl?: string | null;
  aiResponse?: string | null;
  aiConfidence?: number | null;
  detectedPestId?: number | null;
  status: 'pending' | 'resolved' | 'escalated';
  createdAt: Date;
  resolvedAt?: Date | null;
}

@Injectable()
export class AdvisoryQueriesRepository {
  private readonly logger = new Logger(AdvisoryQueriesRepository.name);

  constructor(private readonly database: DatabaseService) {}

  async create(input: {
    farmerId: number;
    profileId?: number;
    districtId?: number;
    queryType: 'pest_disease' | 'weather' | 'general';
    inputMode?: 'text' | 'voice' | 'photo';
    photoUrl?: string;
    aiResponse?: string;
    aiConfidence?: number;
    detectedPestId?: number;
    status?: 'pending' | 'resolved' | 'escalated';
  }): Promise<IAdvisoryQueryRecord> {
    const status = input.status || 'resolved';
    const inputMode = input.inputMode || 'text';

    const result: ResultSetHeader = await this.database.execute(
      `
        INSERT INTO advisory_queries 
          (farmer_id, profile_id, district_id, query_type, input_mode, photo_url, ai_response, ai_confidence, detected_pest_id, status, resolved_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${status === 'resolved' ? 'CURRENT_TIMESTAMP' : 'NULL'})
      `,
      [
        input.farmerId,
        input.profileId || null,
        input.districtId || null,
        input.queryType,
        inputMode,
        input.photoUrl || null,
        input.aiResponse || null,
        input.aiConfidence ?? null,
        input.detectedPestId || null,
        status,
      ],
    );

    const created = await this.findById(result.insertId);
    if (!created) {
      throw new Error(`Failed to retrieve advisory query ${result.insertId}`);
    }
    return created;
  }

  async findById(queryId: number): Promise<IAdvisoryQueryRecord | null> {
    const rows = await this.database.query<RowDataPacket[]>(
      `
        SELECT 
          query_id, farmer_id, profile_id, district_id, query_type, input_mode,
          photo_url, audio_url, ai_response, ai_confidence, detected_pest_id,
          status, created_at, resolved_at
        FROM advisory_queries
        WHERE query_id = ?
        LIMIT 1
      `,
      [queryId],
    );

    if (!rows || rows.length === 0) {
      return null;
    }
    return this.mapRow(rows[0]);
  }

  async findByFarmerId(farmerId: number, limit = 20): Promise<IAdvisoryQueryRecord[]> {
    const rows = await this.database.query<RowDataPacket[]>(
      `
        SELECT 
          query_id, farmer_id, profile_id, district_id, query_type, input_mode,
          photo_url, audio_url, ai_response, ai_confidence, detected_pest_id,
          status, created_at, resolved_at
        FROM advisory_queries
        WHERE farmer_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `,
      [farmerId, limit],
    );

    return rows.map(this.mapRow);
  }

  async updateStatus(
    queryId: number,
    status: 'pending' | 'resolved' | 'escalated',
    aiResponse?: string,
    aiConfidence?: number,
  ): Promise<void> {
    await this.database.execute(
      `
        UPDATE advisory_queries
        SET 
          status = ?,
          ai_response = COALESCE(?, ai_response),
          ai_confidence = COALESCE(?, ai_confidence),
          resolved_at = CASE WHEN ? = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
        WHERE query_id = ?
      `,
      [status, aiResponse || null, aiConfidence ?? null, status, queryId],
    );
  }

  private mapRow(r: any): IAdvisoryQueryRecord {
    return {
      queryId: Number(r.query_id),
      farmerId: Number(r.farmer_id),
      profileId: r.profile_id ? Number(r.profile_id) : null,
      districtId: r.district_id ? Number(r.district_id) : null,
      queryType: r.query_type,
      inputMode: r.input_mode,
      photoUrl: r.photo_url || null,
      audioUrl: r.audio_url || null,
      aiResponse: r.ai_response || null,
      aiConfidence: r.ai_confidence ? Number(r.ai_confidence) : null,
      detectedPestId: r.detected_pest_id ? Number(r.detected_pest_id) : null,
      status: r.status,
      createdAt: new Date(r.created_at),
      resolvedAt: r.resolved_at ? new Date(r.resolved_at) : null,
    };
  }
}
