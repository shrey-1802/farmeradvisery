import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CropsService } from './crops.service';

@ApiTags('Crops & Lookup Data')
@Controller('crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Get()
  @ApiOperation({ summary: 'Get normalized list of supported crops' })
  @ApiResponse({ status: 200, description: 'Crops list retrieved successfully' })
  async getAllCrops() {
    return this.cropsService.getAllCrops();
  }

  @Get('districts')
  @ApiOperation({ summary: 'Get normalized list of geographic districts and states' })
  @ApiResponse({ status: 200, description: 'Districts list retrieved successfully' })
  async getAllDistricts() {
    return this.cropsService.getAllDistricts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific crop' })
  @ApiResponse({ status: 200, description: 'Crop details retrieved successfully' })
  async getCropById(@Param('id', ParseIntPipe) cropId: number) {
    return this.cropsService.getCropById(cropId);
  }

  @Get(':id/fertilizer-guidelines')
  @ApiOperation({ summary: 'Get recommended fertilizer guidelines for a specific crop' })
  @ApiResponse({ status: 200, description: 'Fertilizer guidelines retrieved successfully' })
  async getFertilizerGuidelines(@Param('id', ParseIntPipe) cropId: number) {
    return this.cropsService.getFertilizerGuidelines(cropId);
  }
}
