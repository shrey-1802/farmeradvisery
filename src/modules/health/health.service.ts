import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class HealthService {
  constructor(private readonly databaseService: DatabaseService) {}

  async checkHealth() {
    const isDbHealthy = await this.databaseService.checkHealth();
    
    return {
      status: isDbHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      services: {
        database: isDbHealthy ? 'up' : 'down',
      },
    };
  }
}
