import { AppService } from '@/app.service';
import { CURRENT_VERSION } from '@/shared/constants/version.constant';
import { Public } from '@/shared/decorators/auth.decorator';
import { Controller, Get } from '@nestjs/common';

@Controller({ version: CURRENT_VERSION })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  @Public()
  hello() {
    console.log('hello world');
    return 'Hello World!';
  }
}
