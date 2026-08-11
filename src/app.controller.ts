import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      message: 'Farmer Advisory API is running',
      api: '/api/v1',
      docs: '/api/v1/docs',
    };
  }
}
