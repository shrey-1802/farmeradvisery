import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

export class CreateFarmDto {
  @ApiProperty({ example: 1, description: 'District ID lookup key' })
  @IsInt()
  @IsPositive()
  districtId: number;

  @ApiPropertyOptional({ example: 23.0225, description: 'Farm GPS latitude' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 72.5714, description: 'Farm GPS longitude' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiProperty({ example: 2.5, description: 'Land area size value' })
  @IsNumber()
  @IsPositive()
  landSize: number;

  @ApiPropertyOptional({ example: 'acre', enum: ['acre', 'hectare', 'bigha'] })
  @IsOptional()
  @IsEnum(['acre', 'hectare', 'bigha'])
  landUnit?: 'acre' | 'hectare' | 'bigha';

  @ApiProperty({ example: 1, description: 'Crop ID lookup key' })
  @IsInt()
  @IsPositive()
  cropId: number;

  @ApiProperty({
    example: 'canal',
    enum: ['canal', 'tube_well', 'both', 'rainfed'],
    description: 'Irrigation water source type',
  })
  @IsEnum(['canal', 'tube_well', 'both', 'rainfed'])
  waterSource: 'canal' | 'tube_well' | 'both' | 'rainfed';
}
