import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '9876543210', description: 'Indian 10-digit mobile number' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Phone number must be a valid 10-digit number' })
  phoneNumber: string;
}
