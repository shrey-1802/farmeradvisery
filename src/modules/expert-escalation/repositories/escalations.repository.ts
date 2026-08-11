import { Injectable, Logger } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../database/database.service';

export interface IEscalationRecord {
  escalationId: number;
  queryId: number;
  farmerId: number;
  farmerName?: string;
  farmerPhone?: string;
  districtId?: number;
  districtName?: string;
  photoUrl?: string;
  queryType?: string;
  officerId: number | null;
  officerName?: string;
  officerResponse: string | null;
  status: 'pending' | 'in_review' | 'resolved';
  escalatedAt: Date;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
}

@Injectable()
export class EscalationsRepository {
  private readonly logger = new Logger(EscalationsRepository.name);

  constructor(private readonly database: DatabaseService) {}

  async create(queryId: number): Promise<IEscalationRecord> {
    const result: ResultSetHeader = await this.database.execute(
      `
        INSERT INTO escalations (query_id, status)
        VALUES (?, 'pending')
      `,
      [queryId],
    );

    const created = await this.findById(result.insertId);
    if (!created) {
      throw new Error(`Failed to retrieve newly created escalation ${result.insertId}`);
    }
    return created;
  }

  async findById(escalationId: number): Promise<IEscalationRecord | null> {
    const rows = await this.database.query<RowDataPacket[]>(
      `
        SELECT 
          e.escalation_id, e.query_id, e.officer_id, e.officer_response, e.status,
          e.escalated_at, e.first_response_at, e.resolved_at,
          q.farmer_id, q.district_id, q.photo_url, q.query_type,
          f.name AS farmer_name, f.phone_number AS farmer_phone,
          o.name AS officer_name, d.district_name
        FROM escalations e
        JOIN advisory_queries q ON e.query_id = q.query_id
        JOIN farmers f ON q.farmer_id = f.farmer_id
        LEFT JOIN districts d ON q.district_id = d.district_id
        LEFT JOIN officers o ON e.officer_id = o.officer_id
        WHERE e.escalation_id = ?
        LIMIT 1
      `,
      [escalationId],
    );

    if (!rows || rows.length === 0) {
      return null;
    }
    return this.mapRow(rows[0]);
  }

  async findByDistrict(
    districtId?: number,
    status?: 'pending' | 'in_review' | 'resolved',
  ): Promise<IEscalationRecord[]> {
    let sql = `
      SELECT 
        e.escalation_id, e.query_id, e.officer_id, e.officer_response, e.status,
        e.escalated_at, e.first_response_at, e.resolved_at,
        q.farmer_id, q.district_id, q.photo_url, q.query_type,
        f.name AS farmer_name, f.phone_number AS farmer_phone,
        o.name AS officer_name, d.district_name
      FROM escalations e
      JOIN advisory_queries q ON e.query_id = q.query_id
      JOIN farmers f ON q.farmer_id = f.farmer_id
      LEFT JOIN districts d ON q.district_id = d.district_id
      LEFT JOIN officers o ON e.officer_id = o.officer_id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (districtId) {
      sql += ` AND q.district_id = ?`;
      params.push(districtId);
    }
    if (status) {
      sql += ` AND e.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY e.escalated_at DESC`;

    const rows = await this.database.query<RowDataPacket[]>(sql, params);
    return rows.map(this.mapRow);
  }

  async respond(
    escalationId: number,
    officerId: number,
    officerResponse: string,
  ): Promise<IEscalationRecord | null> {
    await this.database.execute(
      `
        UPDATE escalations
        SET 
          officer_id = ?,
          officer_response = ?,
          status = 'resolved',
          first_response_at = COALESCE(first_response_at, CURRENT_TIMESTAMP),
          resolved_at = CURRENT_TIMESTAMP
        WHERE escalation_id = ?
      `,
      [officerId, officerResponse, escalationId],
    );

    // Also update parent advisory_queries status to resolved
    const updated = await this.findById(escalationId);
    if (updated) {
      await this.database.execute(
        `
          UPDATE advisory_queries
          SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP
          WHERE query_id = ?
        `,
        [updated.queryId],
      );
    }

    return updated;
  }

  private mapRow(r: any): IEscalationRecord {
    return {
      escalationId: Number(r.escalation_id),
      queryId: Number(r.query_id),
      farmerId: Number(r.farmer_id),
      farmerName: r.farmer_name || 'Farmer',
      farmerPhone: r.farmer_phone,
      districtId: r.district_id ? Number(r.district_id) : undefined,
      districtName: r.district_name,
      photoUrl: r.photo_url || undefined,
      queryType: r.query_type,
      officerId: r.officer_id ? Number(r.officer_id) : null,
      officerName: r.officer_name,
      officerResponse: r.officer_response || null,
      status: r.status,
      escalatedAt: new Date(r.escalated_at),
      firstResponseAt: r.first_response_at ? new Date(r.first_response_at) : null,
      resolvedAt: r.resolved_at ? new Date(r.resolved_at) : null,
    };
  }
}
