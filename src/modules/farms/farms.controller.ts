import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, IAuthUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { FarmsService } from './farms.service';

@ApiTags('Farms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Get()
  @ApiOperation({ summary: 'List registered farm plots for current farmer' })
  @ApiResponse({ status: 200, description: 'Farms list retrieved successfully' })
  async getFarmerFarms(@CurrentUser() user: IAuthUser) {
    return this.farmsService.getFarmerFarms(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific farm plot' })
  @ApiResponse({ status: 200, description: 'Farm details retrieved successfully' })
  async getFarmById(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseIntPipe) profileId: number,
  ) {
    return this.farmsService.getFarmById(profileId, user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Register a new farm plot' })
  @ApiResponse({ status: 201, description: 'Farm plot registered successfully' })
  async createFarm(
    @CurrentUser() user: IAuthUser,
    @Body() dto: CreateFarmDto,
  ) {
    return this.farmsService.createFarm(user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a farm plot profile' })
  @ApiResponse({ status: 200, description: 'Farm plot updated successfully' })
  async updateFarm(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseIntPipe) profileId: number,
    @Body() dto: UpdateFarmDto,
  ) {
    return this.farmsService.updateFarm(profileId, user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a farm plot profile' })
  @ApiResponse({ status: 200, description: 'Farm plot deactivated successfully' })
  async deleteFarm(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseIntPipe) profileId: number,
  ) {
    return this.farmsService.deleteFarm(profileId, user.userId);
  }
}
