import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { IFarmProfile } from './farm.types';
import { FarmProfilesRepository } from './repositories/farm-profiles.repository';

@Injectable()
export class FarmsService {
  constructor(private readonly farmProfilesRepository: FarmProfilesRepository) {}

  async getFarmerFarms(farmerId: number): Promise<IFarmProfile[]> {
    return this.farmProfilesRepository.findByFarmerId(farmerId);
  }

  async getFarmById(profileId: number, farmerId: number): Promise<IFarmProfile> {
    const farm = await this.farmProfilesRepository.findById(profileId, farmerId);
    if (!farm) {
      throw new NotFoundException(`Farm profile ${profileId} not found or access denied`);
    }
    return farm;
  }

  async createFarm(farmerId: number, dto: CreateFarmDto): Promise<IFarmProfile> {
    return this.farmProfilesRepository.create({
      farmerId,
      ...dto,
    });
  }

  async updateFarm(
    profileId: number,
    farmerId: number,
    dto: UpdateFarmDto,
  ): Promise<IFarmProfile> {
    const existing = await this.farmProfilesRepository.findById(profileId, farmerId);
    if (!existing) {
      throw new NotFoundException(`Farm profile ${profileId} not found or access denied`);
    }

    const updated = await this.farmProfilesRepository.update(profileId, farmerId, dto);
    if (!updated) {
      throw new Error(`Failed to update farm profile ${profileId}`);
    }
    return updated;
  }

  async deleteFarm(profileId: number, farmerId: number): Promise<{ success: boolean }> {
    const existing = await this.farmProfilesRepository.findById(profileId, farmerId);
    if (!existing) {
      throw new NotFoundException(`Farm profile ${profileId} not found or access denied`);
    }

    const deleted = await this.farmProfilesRepository.delete(profileId, farmerId);
    return { success: deleted };
  }
}
