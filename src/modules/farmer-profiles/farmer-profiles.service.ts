import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateFarmerProfileDto } from './dto/update-farmer-profile.dto';
import { IFarmer } from './farmer-profile.types';
import { FarmersRepository } from './repositories/farmers.repository';

@Injectable()
export class FarmerProfilesService {
  constructor(private readonly farmersRepository: FarmersRepository) {}

  async getProfile(farmerId: number): Promise<IFarmer> {
    const farmer = await this.farmersRepository.findById(farmerId);
    if (!farmer) {
      throw new NotFoundException(`Farmer profile not found for ID ${farmerId}`);
    }
    return farmer;
  }

  async updateProfile(farmerId: number, dto: UpdateFarmerProfileDto): Promise<IFarmer> {
    const existing = await this.farmersRepository.findById(farmerId);
    if (!existing) {
      throw new NotFoundException(`Farmer profile not found for ID ${farmerId}`);
    }

    const updated = await this.farmersRepository.update(farmerId, dto);
    if (!updated) {
      throw new Error(`Failed to update farmer profile for ID ${farmerId}`);
    }
    return updated;
  }
}
