import { Module } from '@nestjs/common';
import { CropsController } from './crops.controller';
import { CropsService } from './crops.service';
import { CropsRepository } from './repositories/crops.repository';

@Module({
  controllers: [CropsController],
  providers: [CropsService, CropsRepository],
  exports: [CropsService, CropsRepository],
})
export class CropsModule {}
