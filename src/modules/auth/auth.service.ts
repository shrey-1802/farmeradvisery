import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../database/database.service';
import { FarmersRepository } from '../farmer-profiles/repositories/farmers.repository';
import { OfficerLoginDto } from './dto/officer-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

interface IOtpStore {
  otp: string;
  expiresAt: number;
  attempts: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpCache = new Map<string, IOtpStore>();

  constructor(
    private readonly farmersRepository: FarmersRepository,
    private readonly database: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async sendOtp(dto: SendOtpDto): Promise<{ message: string; devOtp?: string }> {
    const { phoneNumber } = dto;
    const now = Date.now();
    const existing = this.otpCache.get(phoneNumber);

    if (existing && existing.expiresAt > now && existing.attempts >= 3) {
      throw new BadRequestException('Too many failed OTP attempts. Please wait 5 minutes before requesting again.');
    }

    // Generate 6-digit OTP (e.g. 123456 in dev or random)
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const otp = nodeEnv === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes TTL

    this.otpCache.set(phoneNumber, {
      otp,
      expiresAt,
      attempts: 0,
    });

    this.logger.log(`OTP generated for ${phoneNumber}: ${otp}`);

    return {
      message: `OTP sent successfully to ${phoneNumber}`,
      ...(nodeEnv === 'development' ? { devOtp: otp } : {}),
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const { phoneNumber, otp, name, preferredLanguage } = dto;
    const now = Date.now();
    const stored = this.otpCache.get(phoneNumber);

    if (!stored || stored.expiresAt < now) {
      throw new BadRequestException('OTP has expired or was not requested. Please request a new OTP.');
    }

    if (stored.attempts >= 3) {
      this.otpCache.delete(phoneNumber);
      throw new BadRequestException('Too many invalid attempts. OTP invalidated.');
    }

    if (stored.otp !== otp) {
      stored.attempts += 1;
      this.otpCache.set(phoneNumber, stored);
      throw new BadRequestException(`Invalid OTP code. ${3 - stored.attempts} attempts remaining.`);
    }

    // OTP verified successfully
    this.otpCache.delete(phoneNumber);

    let farmer = await this.farmersRepository.findByPhone(phoneNumber);
    if (!farmer) {
      farmer = await this.farmersRepository.create({
        phoneNumber,
        name,
        preferredLanguage: preferredLanguage || 'en',
      });
    } else if (name || preferredLanguage) {
      farmer = (await this.farmersRepository.update(farmer.farmerId, {
        name,
        preferredLanguage,
      }))!;
    }

    const payload = {
      userId: farmer.farmerId,
      phoneNumber: farmer.phoneNumber,
      role: 'FARMER',
    };

    const tokens = await this.generateTokens(payload);
    return {
      message: 'Authentication successful',
      farmer,
      ...tokens,
    };
  }

  async officerLogin(dto: OfficerLoginDto) {
    const { identifier, password } = dto;

    const rows = await this.database.query<RowDataPacket[]>(
      `
        SELECT 
          officer_id, name, phone_number, email, password_hash, role, district_id, is_active
        FROM officers
        WHERE (phone_number = ? OR email = ?) AND is_active = TRUE
        LIMIT 1
      `,
      [identifier, identifier],
    );

    if (!rows || rows.length === 0) {
      throw new UnauthorizedException('Invalid officer credentials or inactive account');
    }

    const officer = rows[0];
    const isPasswordValid = await bcrypt.compare(password, officer.password_hash || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid officer credentials');
    }

    const payload = {
      userId: Number(officer.officer_id),
      email: officer.email,
      phoneNumber: officer.phone_number,
      role: officer.role, // 'field_officer' or 'admin'
      districtId: officer.district_id ? Number(officer.district_id) : undefined,
    };

    const tokens = await this.generateTokens(payload);

    return {
      message: 'Officer login successful',
      officer: {
        officerId: Number(officer.officer_id),
        name: officer.name,
        email: officer.email,
        phoneNumber: officer.phone_number,
        role: officer.role,
        districtId: officer.district_id,
      },
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const secret = this.configService.get<string>(
        'JWT_REFRESH_SECRET',
        'super_secret_farmer_refresh_key_2026',
      );
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, { secret });

      const newPayload = {
        userId: payload.userId,
        phoneNumber: payload.phoneNumber,
        email: payload.email,
        role: payload.role,
        districtId: payload.districtId,
      };

      const tokens = await this.generateTokens(newPayload);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateTokens(payload: any) {
    const accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'super_secret_farmer_access_key_2026',
    );
    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'super_secret_farmer_refresh_key_2026',
    );

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 mins in seconds
    };
  }
}
