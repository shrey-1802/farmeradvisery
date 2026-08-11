import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, IAuthUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('PDF Reports & WhatsApp Delivery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate multilingual PDF crop advisory report & optional WhatsApp delivery' })
  @ApiResponse({ status: 201, description: 'PDF report generated successfully' })
  async generateReport(
    @CurrentUser() user: IAuthUser,
    @Body('queryId') queryId?: number,
    @Body('sendWhatsapp') sendWhatsapp?: boolean,
  ) {
    const qIdNum = queryId ? Number(queryId) : undefined;
    return this.reportsService.generateReport(user.userId, qIdNum, Boolean(sendWhatsapp));
  }

  @Get()
  @ApiOperation({ summary: 'List generated PDF reports for authenticated farmer' })
  @ApiResponse({ status: 200, description: 'Farmer reports retrieved' })
  async getFarmerReports(@CurrentUser() user: IAuthUser) {
    return this.reportsService.getFarmerReports(user.userId);
  }
}
