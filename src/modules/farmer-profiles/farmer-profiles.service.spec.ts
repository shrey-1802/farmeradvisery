import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FarmerProfilesService } from './farmer-profiles.service';
import { FarmersRepository } from './repositories/farmers.repository';

describe('FarmerProfilesService', () => {
  let service: FarmerProfilesService;
  let repository: jest.Mocked<FarmersRepository>;

  const mockFarmer = {
    farmerId: 1,
    phoneNumber: '9876543210',
    name: 'Ramesh Patel',
    preferredLanguage: 'gu',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findById: jest.fn(),
      findByPhone: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmerProfilesService,
        { provide: FarmersRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<FarmerProfilesService>(FarmerProfilesService);
    repository = module.get(FarmersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return farmer profile if found', async () => {
      repository.findById.mockResolvedValue(mockFarmer);

      const result = await service.getProfile(1);
      expect(result).toEqual(mockFarmer);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if farmer does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update and return updated farmer profile', async () => {
      repository.findById.mockResolvedValue(mockFarmer);
      repository.update.mockResolvedValue({ ...mockFarmer, name: 'Suresh Patel' });

      const result = await service.updateProfile(1, { name: 'Suresh Patel' });
      expect(result.name).toBe('Suresh Patel');
      expect(repository.update).toHaveBeenCalledWith(1, { name: 'Suresh Patel' });
    });
  });
});
