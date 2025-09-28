import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'App is running!';
  }
  
  @Get('health')
  getHealth(): { status: string } {
    return { status: 'OK' };
  }
}