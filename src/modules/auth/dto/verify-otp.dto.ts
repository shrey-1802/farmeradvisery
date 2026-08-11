import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '9876543210', description: 'Indian 10-digit mobile number' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Phone number must be a valid 10-digit number' })
  phoneNumber: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{6}$/, { message: 'OTP must be a 6-digit number' })
  otp: string;

  @ApiPropertyOptional({ example: 'Ramesh Patel', description: 'Farmer full name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'gu', description: 'Preferred language (gu, hi, en)' })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'hi', 'gu'])
  preferredLanguage?: string;
}
