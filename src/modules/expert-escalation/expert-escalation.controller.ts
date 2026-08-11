import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, IAuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RespondEscalationDto } from './dto/respond-escalation.dto';
import { ExpertEscalationService } from './expert-escalation.service';

@ApiTags('Expert Escalations (Officer & Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('field_officer', 'admin')
@Controller('officer/escalations')
export class ExpertEscalationController {
  constructor(private readonly escalationService: ExpertEscalationService) {}

  @Get()
  @ApiOperation({ summary: 'List pending or in-review expert cases for officer district' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'in_review', 'resolved'] })
  @ApiResponse({ status: 200, description: 'Escalated cases retrieved successfully' })
  async getEscalations(
    @CurrentUser() user: IAuthUser,
    @Query('status') status?: 'pending' | 'in_review' | 'resolved',
  ) {
    return this.escalationService.getEscalationsForOfficer(user.districtId, status);
  }

  @Put(':id/respond')
  @ApiOperation({ summary: 'Field officer submits diagnosis resolution response' })
  @ApiResponse({ status: 200, description: 'Resolution response recorded successfully' })
  async respondToEscalation(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseIntPipe) escalationId: number,
    @Body() dto: RespondEscalationDto,
  ) {
    return this.escalationService.respondToEscalation(escalationId, user.userId, dto);
  }
}
