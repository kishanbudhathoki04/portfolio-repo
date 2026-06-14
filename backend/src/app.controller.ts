import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot(): string {
    return 'Server is running';
  }

  @Get('health')
  getHealth(): { status: string } {
    return { status: 'OK' };
  }
}
