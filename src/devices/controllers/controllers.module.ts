import { Module } from '@nestjs/common';
import { ControllersService } from './controllers.service';
import { ControllersController } from './controllers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceControllersModel } from './entities/device-controller.entity';
import { DevicesModule } from '../devices.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceControllersModel]), DevicesModule],
  exports: [],
  controllers: [ControllersController],
  providers: [ControllersService],
})
export class ControllersModule {}
