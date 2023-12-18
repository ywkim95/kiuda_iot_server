import { Module, forwardRef } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { GatewaysModule } from 'src/gateways/gateways.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesModel } from './entities/device.entity';
import { CommonModule } from 'src/common/common.module';
import { DevicesLogModel } from './entities/device-log.entity';
import { ContDeviceModule } from 'src/controllers/device/device-controller.module';
import { SensorDeviceModule } from 'src/sensors/device/device-sensor.module';
import { ContSpecModule } from 'src/controllers/specifications/specifications-controller.module';

@Module({
  imports: [
    CommonModule,
    forwardRef(() => ContDeviceModule),
    forwardRef(() => SensorDeviceModule),
    ContSpecModule,
    GatewaysModule,
    TypeOrmModule.forFeature([DevicesModel, DevicesLogModel]),
  ],
  exports: [DevicesService],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
//
