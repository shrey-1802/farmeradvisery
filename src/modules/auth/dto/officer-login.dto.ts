import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class OfficerLoginDto {
  @ApiProperty({ example: 'officer@agri.gov.in', description: 'Officer email or phone number' })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'OfficerPass123!', description: 'Officer account password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
