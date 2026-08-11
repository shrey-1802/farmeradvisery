import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, IAuthUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DiagnosisService } from './diagnosis.service';

@ApiTags('AI Crop Diagnosis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('diagnosis')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload crop photo for AI pest/disease diagnosis & optional expert escalation' })
  @ApiResponse({ status: 200, description: 'Image processed; AI diagnosis and confidence assessment returned' })
  async uploadCropPhoto(
    @CurrentUser() user: IAuthUser,
    @UploadedFile() file: any,
    @Body('farmProfileId') farmProfileId?: string,
  ) {
    const profileIdNum = farmProfileId ? Number(farmProfileId) : undefined;
    return this.diagnosisService.processCropImageUpload(user.userId, file, profileIdNum);
  }

  @Get('status/:queryId')
  @ApiOperation({ summary: 'Check diagnosis query status and response' })
  @ApiResponse({ status: 200, description: 'Diagnosis status retrieved' })
  async getDiagnosisStatus(
    @Param('queryId', ParseIntPipe) queryId: number,
  ) {
    return this.diagnosisService.getDiagnosisStatus(queryId);
  }
}
