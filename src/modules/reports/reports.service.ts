import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { getFontFaceCSS, getFontFamily } from '../../common/utils/pdf-fonts.config';
import { WhatsAppNotificationProvider } from '../../providers/notifications/whatsapp.provider';
import { AdvisoryQueriesRepository } from '../advisory/repositories/advisory-queries.repository';
import { FarmerProfilesService } from '../farmer-profiles/farmer-profiles.service';
import { ReportsRepository } from './repositories/reports.repository';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  private readonly reportsDir: string;

  constructor(
    private readonly reportsRepo: ReportsRepository,
    private readonly farmerProfilesService: FarmerProfilesService,
    private readonly advisoryQueriesRepo: AdvisoryQueriesRepository,
    private readonly whatsappProvider: WhatsAppNotificationProvider,
  ) {
    this.reportsDir = path.join(process.cwd(), 'uploads', 'reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generateReport(farmerId: number, queryId?: number, sendWhatsapp = false) {
    const farmer = await this.farmerProfilesService.getProfile(farmerId);
    let queryDetails = null;

    if (queryId) {
      queryDetails = await this.advisoryQueriesRepo.findById(queryId);
      if (!queryDetails) {
        throw new NotFoundException(`Advisory query ${queryId} not found`);
      }
    }

    const lang = (farmer.preferredLanguage as 'en' | 'gu') === 'gu' ? 'gu' : 'en';
    const fontFaceCSS = getFontFaceCSS();
    const fontFamily = getFontFamily(lang);

    const filename = `Report_${farmerId}_${Date.now()}.html`;
    const targetPath = path.join(this.reportsDir, filename);

    // Labels per language (en / gu — Hindi excluded)
    const labels = {
      en: {
        title: 'Kisan Crop Advisory Report',
        farmerName: 'Farmer Name',
        mobile: 'Mobile',
        language: 'Language',
        date: 'Date',
        advisoryDetails: 'Advisory Details',
        queryType: 'Query Type',
        status: 'Status',
        diagnosisResponse: 'Diagnosis / Advisory Response',
        disclaimer: 'Disclaimer',
        disclaimerText:
          'This advisory report is provided for decision support purposes only. Always consult a registered local agricultural officer before applying chemical pesticides or fertilizers.',
        reportId: 'Report ID',
        generatedBy: 'Farmer Crop Advisory Platform — AI-Assisted Decision Support System',
      },
      gu: {
        title: 'કિસાન પાક સલાહ અહેવાલ',
        farmerName: 'ખેડૂતનું નામ',
        mobile: 'મોબાઇલ',
        language: 'ભાષા',
        date: 'તારીખ',
        advisoryDetails: 'સલાહ વિગત',
        queryType: 'ક્વેરી પ્રકાર',
        status: 'સ્થિતિ',
        diagnosisResponse: 'નિદાન / સલાહ',
        disclaimer: 'અસ્વીકૃતિ',
        disclaimerText:
          'આ સલાહ અહેવાલ માત્ર નિર્ણય સહાય માટે છે. રાસાયણિક જંતુનાશકો અથવા ખાતરો લગાવતા પહેલાં નોંધાયેલ સ્થાનિક કૃષિ અધિકારીની સલાહ લો.',
        reportId: 'અહેવાલ ID',
        generatedBy: 'કિસાન પાક સલાહ પ્લેટફોર્મ — AI-સહાયિત નિર્ણય સહાય સિસ્ટમ',
      },
    };

    const L = labels[lang];
    const reportId = `RPT-${farmerId}-${Date.now()}`;
    const dateStr = new Date().toLocaleDateString('en-IN');
    const langLabel = lang === 'gu' ? 'ગુજરાતી' : 'English';

    const reportHtml = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8"/>
  <title>${L.title}</title>
  <style>
    ${fontFaceCSS}

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: ${fontFamily};
      font-size: 14px;
      color: #1a1a1a;
      background: #ffffff;
      padding: 32px 40px;
      line-height: 1.7;
    }

    /* ---- Header ---- */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #2e7d32;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header-left h1 {
      font-size: 22px;
      font-weight: 700;
      color: #2e7d32;
    }
    .header-left p {
      font-size: 11px;
      color: #666;
      margin-top: 2px;
    }
    .badge {
      background: #2e7d32;
      color: #fff;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    /* ---- Farmer Info Card ---- */
    .card {
      background: #f9fbe7;
      border: 1px solid #c5e1a5;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 13px;
      font-weight: 700;
      color: #33691e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 24px;
    }
    .info-row {
      display: flex;
      gap: 8px;
    }
    .info-label {
      color: #555;
      font-weight: 600;
      min-width: 100px;
      flex-shrink: 0;
    }
    .info-value {
      color: #1a1a1a;
    }

    /* ---- Advisory Section ---- */
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #2e7d32;
      border-left: 4px solid #2e7d32;
      padding-left: 10px;
      margin: 22px 0 12px;
    }

    .response-box {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px 20px;
      font-size: 13.5px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* ---- Disclaimer ---- */
    .disclaimer {
      margin-top: 32px;
      border-top: 1px solid #e0e0e0;
      padding-top: 14px;
    }
    .disclaimer-title {
      font-size: 11px;
      font-weight: 700;
      color: #b71c1c;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .disclaimer-text {
      font-size: 11px;
      color: #777;
    }

    /* ---- Footer ---- */
    .footer {
      margin-top: 28px;
      text-align: center;
      font-size: 10px;
      color: #aaa;
      border-top: 1px solid #eee;
      padding-top: 10px;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <h1>${L.title}</h1>
      <p>${L.generatedBy}</p>
    </div>
    <div class="badge">🌾 ${langLabel}</div>
  </div>

  <!-- Farmer Information -->
  <div class="card">
    <div class="card-title">👤 ${L.farmerName}</div>
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">${L.farmerName}:</span>
        <span class="info-value">${farmer.name || '—'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${L.mobile}:</span>
        <span class="info-value">${farmer.phoneNumber}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${L.language}:</span>
        <span class="info-value">${langLabel}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${L.date}:</span>
        <span class="info-value">${dateStr}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${L.reportId}:</span>
        <span class="info-value">${reportId}</span>
      </div>
    </div>
  </div>

  <!-- Advisory Details -->
  <div class="section-title">📋 ${L.advisoryDetails}</div>
  <div class="card">
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">${L.queryType}:</span>
        <span class="info-value">${queryDetails?.queryType || 'Weather Advisory'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${L.status}:</span>
        <span class="info-value">${queryDetails?.status || 'Resolved'}</span>
      </div>
    </div>
  </div>

  <div class="section-title">🔬 ${L.diagnosisResponse}</div>
  <div class="response-box">
${queryDetails?.aiResponse
  ? (() => {
      try {
        const parsed = JSON.parse(queryDetails.aiResponse);
        return Array.isArray(parsed)
          ? parsed.map((a: any) => `• ${a.title}\n  ${a.message}`).join('\n\n')
          : queryDetails.aiResponse;
      } catch {
        return queryDetails.aiResponse;
      }
    })()
  : 'Favorable weather observed. Continue routine field inspection, balanced fertilization, and drainage maintenance as per Soil Health Card guidelines.'}
  </div>

  <!-- Disclaimer -->
  <div class="disclaimer">
    <div class="disclaimer-title">⚠️ ${L.disclaimer}</div>
    <div class="disclaimer-text">${L.disclaimerText}</div>
  </div>

  <!-- Footer -->
  <div class="footer">
    ${L.reportId}: ${reportId} &nbsp;|&nbsp; ${dateStr} &nbsp;|&nbsp; Farmer Crop Advisory Platform
  </div>

</body>
</html>`;

    await fs.promises.writeFile(targetPath, reportHtml, 'utf8');
    this.logger.log(`Report generated: uploads/reports/${filename}`);

    const pdfUrl = `/uploads/reports/${filename}`;
    const reportRecord = await this.reportsRepo.create(farmerId, pdfUrl, queryId);

    if (sendWhatsapp) {
      await this.whatsappProvider.sendPdfReport({
        recipientPhone: farmer.phoneNumber,
        pdfUrl: `http://localhost:3000${pdfUrl}`,
        messageText: lang === 'gu'
          ? `નમસ્તે ${farmer.name || 'ખેડૂત'}, તમારો પાક સલાહ અહેવાલ તૈયાર છે.`
          : `Namaste ${farmer.name || 'Farmer'}, your crop advisory report is ready.`,
      });
      await this.reportsRepo.markWhatsappSent(reportRecord.reportId);
    }

    return {
      reportId: reportRecord.reportId,
      pdfUrl,
      sentViaWhatsapp: sendWhatsapp,
      generatedAt: reportRecord.generatedAt,
    };
  }

  async getFarmerReports(farmerId: number) {
    return this.reportsRepo.findByFarmerId(farmerId);
  }
}
