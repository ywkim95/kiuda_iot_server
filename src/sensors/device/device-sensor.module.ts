import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorDeviceModel } from './entities/device-sensor.entity';
import { CommonModule } from 'src/common/common.module';
import { DevicesModule } from 'src/devices/devices.module';
import { SensorDeviceService } from './device-sensor.service';
import { SensorDeviceController } from './device-sensor.controller';
import { SensorSpecModule } from '../specifications/specifications-sensor.module';
import { SensorDeviceLogModel } from './entities/device-sensor-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SensorDeviceModel, SensorDeviceLogModel]),
    DevicesModule,
    CommonModule,
    SensorSpecModule,
  ],
  exports: [SensorDeviceService],
  controllers: [SensorDeviceController],
  providers: [SensorDeviceService],
})
export class SensorDeviceModule {}
