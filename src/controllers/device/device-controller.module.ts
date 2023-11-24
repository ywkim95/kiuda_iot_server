import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContDeviceModel } from './entities/devices-controller.entity';
import { DevicesModel } from 'src/devices/entities/device.entity';
import { CommonModule } from 'src/common/common.module';
import { ContDeviceController } from './device-controller.controller';
import { ContDeviceService } from './device-controller.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContDeviceModel]),
    DevicesModel,
    CommonModule,
  ],
  exports: [ContDeviceService],
  controllers: [ContDeviceController],
  providers: [ContDeviceService],
})
export class ContDeviceModule {}
