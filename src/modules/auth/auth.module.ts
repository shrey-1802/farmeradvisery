import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FarmerProfilesModule } from '../farmer-profiles/farmer-profiles.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({}),
    FarmerProfilesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
