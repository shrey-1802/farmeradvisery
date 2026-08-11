import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, IAuthUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdvisoryService } from './advisory.service';
import { GenerateAdvisoryDto } from './dto/generate-advisory.dto';

@ApiTags('Advisory Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('advisory')
export class AdvisoryController {
  constructor(private readonly advisoryService: AdvisoryService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate weather and rule-based agronomic crop advisory' })
  @ApiResponse({ status: 200, description: 'Advisory rules evaluated and returned successfully' })
  async generateAdvisory(
    @CurrentUser() user: IAuthUser,
    @Body() dto: GenerateAdvisoryDto,
  ) {
    return this.advisoryService.generateAdvisory(user.userId, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get past advisory query history for authenticated farmer' })
  @ApiResponse({ status: 200, description: 'Past advisory queries retrieved' })
  async getHistory(@CurrentUser() user: IAuthUser) {
    return this.advisoryService.getHistory(user.userId);
  }
}
