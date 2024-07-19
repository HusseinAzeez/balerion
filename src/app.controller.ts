import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '@/common/decorators/public.decorator';
import { AppService } from './app.service';
import { GetCurrentUserId } from './common/decorators';

@ApiTags('Default')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('me')
  @ApiBearerAuth()
  getProfile(@GetCurrentUserId() id: number) {
    return this.appService.getProfile(id);
  }
}
