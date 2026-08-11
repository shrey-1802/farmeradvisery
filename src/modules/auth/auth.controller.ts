import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { OfficerLoginDto } from './dto/officer-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('farmer/send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send 6-digit OTP to farmer mobile number' })
  @ApiResponse({ status: 200, description: 'OTP generated and sent' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Post('farmer/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify mobile OTP code and authenticate farmer' })
  @ApiResponse({ status: 200, description: 'Farmer authenticated; JWT access and refresh tokens returned' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('officer/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Field officer or admin authentication with email/phone and password' })
  @ApiResponse({ status: 200, description: 'Officer authenticated; JWT tokens returned' })
  async officerLogin(@Body() dto: OfficerLoginDto) {
    return this.authService.officerLogin(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue new access token' })
  @ApiResponse({ status: 200, description: 'New JWT access token generated' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }
}
