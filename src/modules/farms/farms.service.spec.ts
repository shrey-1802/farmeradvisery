import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IFarmProfile } from './farm.types';
import { FarmsService } from './farms.service';
import { FarmProfilesRepository } from './repositories/farm-profiles.repository';

describe('FarmsService', () => {
  let service: FarmsService;
  let repository: jest.Mocked<FarmProfilesRepository>;

  const mockFarm: IFarmProfile = {
    profileId: 10,
    farmerId: 1,
    districtId: 2,
    districtName: 'Anand',
    stateName: 'Gujarat',
    landSize: 3.5,
    landUnit: 'acre',
    cropId: 1,
    cropName: 'Wheat',
    waterSource: 'canal',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findByFarmerId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmsService,
        { provide: FarmProfilesRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<FarmsService>(FarmsService);
    repository = module.get(FarmProfilesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFarmerFarms', () => {
    it('should return list of farmer farm plots', async () => {
      repository.findByFarmerId.mockResolvedValue([mockFarm]);

      const result = await service.getFarmerFarms(1);
      expect(result).toEqual([mockFarm]);
      expect(repository.findByFarmerId).toHaveBeenCalledWith(1);
    });
  });

  describe('getFarmById', () => {
    it('should return farm details if profile exists and belongs to farmer', async () => {
      repository.findById.mockResolvedValue(mockFarm);

      const result = await service.getFarmById(10, 1);
      expect(result).toEqual(mockFarm);
    });

    it('should throw NotFoundException if farm not found or ownership fails', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getFarmById(99, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
