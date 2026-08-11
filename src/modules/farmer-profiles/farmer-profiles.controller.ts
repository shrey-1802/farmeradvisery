import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, IAuthUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateFarmerProfileDto } from './dto/update-farmer-profile.dto';
import { FarmerProfilesService } from './farmer-profiles.service';

@ApiTags('Farmer Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('farmer/profile')
export class FarmerProfilesController {
  constructor(private readonly farmerProfilesService: FarmerProfilesService) {}

  @Get()
  @ApiOperation({ summary: 'Get current authenticated farmer profile' })
  @ApiResponse({ status: 200, description: 'Farmer profile retrieved successfully' })
  async getProfile(@CurrentUser() user: IAuthUser) {
    return this.farmerProfilesService.getProfile(user.userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update current authenticated farmer profile' })
  @ApiResponse({ status: 200, description: 'Farmer profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: IAuthUser,
    @Body() dto: UpdateFarmerProfileDto,
  ) {
    return this.farmerProfilesService.updateProfile(user.userId, dto);
  }
}
