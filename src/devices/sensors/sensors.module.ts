import { Module } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { SensorsController } from './sensors.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorSpecificationsModel } from './specifications/entities/specifications-sensor.entity';
import { DeviceSensorsModel } from './device/entities/device-sensor.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { RealTimeControllersModel } from './real-time/entities/real-time-controller.entity';
import { RealTimeSensorsModel } from './real-time/entities/real-time-sensor.entity';
import { RealTimeService } from './real-time/real-time.service';
import { RealTimeGateway } from './real-time/real-time.gateway';
import { GatewaysModule } from 'src/gateways/gateways.module';
import { RealTimeController } from './real-time/real-time.controller';
import { DeviceControllersModel } from '../controllers/entities/device-controller.entity';
import { DevicesModule } from '../devices.module';
import { SpecificationsService } from './specifications/specifications-sensor.service';
import { DeviceSensorsService } from './device/device-sensor.service';
import { SpecificationsSensorController } from './specifications/specifications-sensor.controller';
import { DeviceSensorsController } from './device/device-sensor.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SensorSpecificationsModel,
      DeviceSensorsModel,
      DeviceControllersModel,
      RealTimeControllersModel,
      RealTimeSensorsModel,
    ]),
    CommonModule,
    AuthModule,
    UsersModule,
    GatewaysModule,
    DevicesModule,
  ],
  exports: [
    SensorsService,
    RealTimeService,
    RealTimeGateway,
    SpecificationsService,
    DeviceSensorsService,
  ],
  controllers: [
    SensorsController,
    RealTimeController,
    SpecificationsSensorController,
    DeviceSensorsController,
  ],
  providers: [
    SensorsService,
    RealTimeService,
    RealTimeGateway,
    SpecificationsService,
    DeviceSensorsService,
  ],
})
export class SensorsModule {}
