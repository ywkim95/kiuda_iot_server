import { Module } from '@nestjs/common';
import { ControllersService } from './controllers.service';
import { ControllersController } from './controllers.controller';

@Module({
  imports: [],
  exports: [],
  controllers: [ControllersController],
  providers: [ControllersService],
})
export class ControllersModule {}
