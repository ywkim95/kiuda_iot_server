import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContRealTimeDataModel } from './entities/real-time/real-time-controller.entity';
import { SensorRealTimeDataModel } from './entities/real-time/real-time-sensor.entity';
import { MonthlyAverageModel } from './entities/average/monthly-average.entity';
import { DailyAverageModel } from './entities/average/daily-average.entity';
import { FiveMinutesAverageModel } from './entities/average/five-minutes-average.entity';
import { AccumulatedIrradianceModel } from './entities/accumulate/accumulated-irradiance.entity';
import { RealTimeDataService } from './real-time-data.service';
import { RealTimeDataGateway } from './real-time-data.gateway';
import { RealTimeDataController } from './real-time-data.controller';
import { DevicesModule } from 'src/devices/devices.module';
import { CommonModule } from 'src/common/common.module';
import { SensorDeviceModule } from '../sensors/device/device-sensor.module';
import { SensorSpecModule } from '../sensors/specifications/specifications-sensor.module';
import { ContDeviceModule } from 'src/controllers/device/device-controller.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { GatewaysModule } from 'src/gateways/gateways.module';
import { RealTimeDataSaveService } from './real-time-data-save.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContRealTimeDataModel,
      SensorRealTimeDataModel,
      MonthlyAverageModel,
      DailyAverageModel,
      FiveMinutesAverageModel,
      AccumulatedIrradianceModel,
    ]),
    DevicesModule,
    CommonModule,
    ContDeviceModule,
    AuthModule,
    UsersModule,
    GatewaysModule,
    NotificationsModule,
    SensorDeviceModule,
    SensorSpecModule,
  ],
  exports: [RealTimeDataService, RealTimeDataSaveService, RealTimeDataGateway],
  controllers: [RealTimeDataController],
  providers: [
    RealTimeDataService,
    RealTimeDataSaveService,
    RealTimeDataGateway,
  ],
})
export class RealTimeDataModule {}
