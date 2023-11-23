import { Module } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { SensorsController } from './sensors.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorSpecificationsModel } from './specifications/entities/specifications-sensor.entity';
import { DeviceSensorsModel } from './device/entities/device-sensor.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { RealTimeControllersModel } from './real-time/entities/real-time/real-time-controller.entity';
import { RealTimeSensorsModel } from './real-time/entities/real-time/real-time-sensor.entity';
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
import { AccumulatedIrradianceModel } from './real-time/entities/accumulate/accumulated-irradiance.entity';
import { DailyAverageModel } from './real-time/entities/average/daily-average.entity';
import { FiveMinutesAverageModel } from './real-time/entities/average/five-minutes-average.entity';
import { MonthlyAverageModel } from './real-time/entities/average/monthly-average.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SensorSpecificationsModel,
      DeviceSensorsModel,
      DeviceControllersModel,
      RealTimeControllersModel,
      RealTimeSensorsModel,
      AccumulatedIrradianceModel,
      DailyAverageModel,
      FiveMinutesAverageModel,
      MonthlyAverageModel,
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
