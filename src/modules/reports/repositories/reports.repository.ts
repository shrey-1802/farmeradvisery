import { Injectable, Logger } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../database/database.service';

export interface IReportRecord {
  reportId: number;
  farmerId: number;
  queryId: number | null;
  pdfUrl: string;
  sentViaWhatsapp: boolean;
  generatedAt: Date;
}

@Injectable()
export class ReportsRepository {
  private readonly logger = new Logger(ReportsRepository.name);

  constructor(private readonly database: DatabaseService) {}

  async create(farmerId: number, pdfUrl: string, queryId?: number): Promise<IReportRecord> {
    const result: ResultSetHeader = await this.database.execute(
      `
        INSERT INTO reports (farmer_id, query_id, pdf_url, sent_via_whatsapp)
        VALUES (?, ?, ?, FALSE)
      `,
      [farmerId, queryId || null, pdfUrl],
    );

    const created = await this.findById(result.insertId);
    if (!created) {
      throw new Error(`Failed to fetch report ${result.insertId}`);
    }
    return created;
  }

  async findById(reportId: number): Promise<IReportRecord | null> {
    const rows = await this.database.query<RowDataPacket[]>(
      `
        SELECT report_id, farmer_id, query_id, pdf_url, sent_via_whatsapp, generated_at
        FROM reports
        WHERE report_id = ?
        LIMIT 1
      `,
      [reportId],
    );

    if (!rows || rows.length === 0) {
      return null;
    }
    const r = rows[0];
    return {
      reportId: Number(r.report_id),
      farmerId: Number(r.farmer_id),
      queryId: r.query_id ? Number(r.query_id) : null,
      pdfUrl: r.pdf_url,
      sentViaWhatsapp: Boolean(r.sent_via_whatsapp),
      generatedAt: new Date(r.generated_at),
    };
  }

  async markWhatsappSent(reportId: number): Promise<void> {
    await this.database.execute(
      `
        UPDATE reports
        SET sent_via_whatsapp = TRUE
        WHERE report_id = ?
      `,
      [reportId],
    );
  }

  async findByFarmerId(farmerId: number): Promise<IReportRecord[]> {
    const rows = await this.database.query<RowDataPacket[]>(
      `
        SELECT report_id, farmer_id, query_id, pdf_url, sent_via_whatsapp, generated_at
        FROM reports
        WHERE farmer_id = ?
        ORDER BY generated_at DESC
      `,
      [farmerId],
    );

    return rows.map((r) => ({
      reportId: Number(r.report_id),
      farmerId: Number(r.farmer_id),
      queryId: r.query_id ? Number(r.query_id) : null,
      pdfUrl: r.pdf_url,
      sentViaWhatsapp: Boolean(r.sent_via_whatsapp),
      generatedAt: new Date(r.generated_at),
    }));
  }
}
