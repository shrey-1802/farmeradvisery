import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FarmerProfilesController } from './farmer-profiles.controller';
import { FarmerProfilesService } from './farmer-profiles.service';
import { FarmersRepository } from './repositories/farmers.repository';

@Module({
  imports: [JwtModule],
  controllers: [FarmerProfilesController],
  providers: [FarmerProfilesService, FarmersRepository],
  exports: [FarmerProfilesService, FarmersRepository],
})
export class FarmerProfilesModule {}
