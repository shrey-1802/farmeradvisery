import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFarmerProfileDto {
  @ApiPropertyOptional({ example: 'Ramesh Patel', description: 'Farmer full name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'gu', description: 'Preferred language code (gu, hi, en)' })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'hi', 'gu'])
  preferredLanguage?: string;
}
