import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FarmsController } from './farms.controller';
import { FarmsService } from './farms.service';
import { FarmProfilesRepository } from './repositories/farm-profiles.repository';

@Module({
  imports: [JwtModule],
  controllers: [FarmsController],
  providers: [FarmsService, FarmProfilesRepository],
  exports: [FarmsService, FarmProfilesRepository],
})
export class FarmsModule {}
