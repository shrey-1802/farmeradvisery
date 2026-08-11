import { Injectable, NotFoundException } from '@nestjs/common';
import { ICrop, IDistrict, IFertilizerGuideline } from './crop.types';
import { CropsRepository } from './repositories/crops.repository';

@Injectable()
export class CropsService {
  constructor(private readonly cropsRepository: CropsRepository) {}

  async getAllCrops(): Promise<ICrop[]> {
    return this.cropsRepository.findAllCrops();
  }

  async getCropById(cropId: number): Promise<ICrop> {
    const crop = await this.cropsRepository.findCropById(cropId);
    if (!crop) {
      throw new NotFoundException(`Crop with ID ${cropId} not found`);
    }
    return crop;
  }

  async getAllDistricts(): Promise<IDistrict[]> {
    return this.cropsRepository.findAllDistricts();
  }

  async getFertilizerGuidelines(cropId: number): Promise<IFertilizerGuideline[]> {
    await this.getCropById(cropId); // verify existence
    return this.cropsRepository.findFertilizerGuidelines(cropId);
  }
}
