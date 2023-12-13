import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsPublic } from './common/decorator/is-public.decorator';

@ApiTags('example')
@Controller('example')
export class ApiController {
  @Get()
  @ApiResponse({ status: 200, description: 'Return example.' })
  @IsPublic()
  getExample(): string {
    return 'This is an example';
  }
}
