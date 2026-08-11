import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class GenerateAdvisoryDto {
  @ApiProperty({ example: 1, description: 'Farm plot profile ID' })
  @IsInt()
  @IsPositive()
  farmProfileId: number;

  @ApiPropertyOptional({ example: 'gu', description: 'Target output language: en (English) or gu (Gujarati)' })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'gu'])
  language?: 'en' | 'gu';
}
