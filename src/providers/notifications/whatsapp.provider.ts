import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface IWhatsAppMessagePayload {
  recipientPhone: string;
  templateName?: string;
  pdfUrl?: string;
  messageText?: string;
}

@Injectable()
export class WhatsAppNotificationProvider {
  private readonly logger = new Logger(WhatsAppNotificationProvider.name);
  private readonly enabled: boolean;
  private readonly accessToken: string;
  private readonly phoneNumberId: string;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<string>('WHATSAPP_ENABLED') === 'true';
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN', '');
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID', '');
  }

  async sendPdfReport(payload: IWhatsAppMessagePayload): Promise<{ success: boolean; messageId?: string }> {
    if (!this.enabled) {
      this.logger.log(
        `[WhatsApp Disabled] Simulated PDF delivery to ${payload.recipientPhone}: ${payload.pdfUrl}`,
      );
      return { success: true, messageId: `sim_wa_${Date.now()}` };
    }

    try {
      this.logger.log(`Sending WhatsApp PDF message to ${payload.recipientPhone}`);
      const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: payload.recipientPhone,
          type: 'document',
          document: {
            link: payload.pdfUrl,
            filename: 'Crop_Advisory_Report.pdf',
            caption: payload.messageText || 'Your Farmer Crop Advisory Report is ready.',
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${JSON.stringify(data)}`);
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id || `wa_${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(`Failed to deliver WhatsApp message to ${payload.recipientPhone}: ${error.message}`);
      return { success: false };
    }
  }
}
