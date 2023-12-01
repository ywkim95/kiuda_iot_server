import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { ContDeviceModule } from 'src/controllers/device/device-controller.module';
import { SensorDeviceModule } from 'src/sensors/device/device-sensor.module';
import { DevicesModule } from 'src/devices/devices.module';

@Module({
  imports: [ContDeviceModule, SensorDeviceModule, DevicesModule],
  exports: [SettingsService],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
