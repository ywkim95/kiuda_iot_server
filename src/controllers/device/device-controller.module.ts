import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContDeviceModel } from './entities/devices-controller.entity';
import { DevicesModel } from 'src/devices/entities/device.entity';
import { CommonModule } from 'src/common/common.module';
import { ContDeviceController } from './device-controller.controller';
import { ContDeviceService } from './device-controller.service';
import { CustomSettingRangeModel } from './entities/custom-setting-range.entity';
import { UserCustomValueModel } from './entities/user-custom-value.entity';
import { SensorDeviceModule } from 'src/sensors/device/device-sensor.module';
import { ContDeviceLogModel } from './entities/devices-controller-log.entity';
import { CustomSettingRangeLogModel } from './entities/custom-setting-range-log.entity';
import { UserCustomValueLogModel } from './entities/user-custom-value-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContDeviceModel,
      ContDeviceLogModel,
      CustomSettingRangeModel,
      CustomSettingRangeLogModel,
      UserCustomValueModel,
      UserCustomValueLogModel,
    ]),
    DevicesModel,
    CommonModule,
    SensorDeviceModule,
  ],
  exports: [ContDeviceService],
  controllers: [ContDeviceController],
  providers: [ContDeviceService],
})
export class ContDeviceModule {}
