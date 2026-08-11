import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RespondEscalationDto {
  @ApiProperty({
    example:
      'Field inspection recommended. Apply neem oil (5ml/L) and ensure field drainage.',
    description: 'Expert agricultural officer diagnosis and recommended resolution',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  officerResponse: string;
}
