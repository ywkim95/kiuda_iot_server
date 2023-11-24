import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY,
} from './common/const/env-keys.const';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AccessTokenGuard } from './auth/guard/bearer-token.guard';
import { RolesGuard } from './users/guard/roles.guard';
import { UsersModel } from './users/entity/users.entity';
import { UsersLogModel } from './users/entity/users-log.entity';
import { GatewaysModule } from './gateways/gateways.module';
import { GatewaysModel } from './gateways/entities/gateway.entity';
import { GatewaysGeneralLogModel } from './gateways/entities/gateway-general-log.entity';
import { GatewaysConfigLogModel } from './gateways/entities/gateway-config-log.entity';
import { SensorSpecModel } from './sensors/specifications/entities/specifications-sensor.entity';
import { SensorDeviceModel } from './sensors/device/entities/device-sensor.entity';
import { DevicesModule } from './devices/devices.module';
import { DevicesModel } from './devices/entities/device.entity';
import { ContRealTimeDataModel } from './real-time-data/entities/real-time/real-time-controller.entity';
import { SensorRealTimeDataModel } from './real-time-data/entities/real-time/real-time-sensor.entity';
import { AccumulatedIrradianceModel } from './real-time-data/entities/accumulate/accumulated-irradiance.entity';
import { DailyAverageModel } from './real-time-data/entities/average/daily-average.entity';
import { FiveMinutesAverageModel } from './real-time-data/entities/average/five-minutes-average.entity';
import { MonthlyAverageModel } from './real-time-data/entities/average/monthly-average.entity';
import { ContDeviceModel } from './controllers/device/entities/devices-controller.entity';
import { ContSpecModel } from './controllers/specifications/entities/specifications-controller.entity';
import { ContSpecStepModel } from './controllers/specifications/entities/specifications-step.entity';
import { ContMapModel } from './controllers/mappings/entities/mappings-controller.entity';
import { ContDeviceModule } from './controllers/device/device-controller.module';
import { ContSpecModule } from './controllers/specifications/specifications-controller.module';
import { ContMapModule } from './controllers/mappings/mappings-controller.module';
import { RealTimeDataModule } from './real-time-data/real-time-data.module';
import { SensorSpecModule } from './sensors/specifications/specifications-sensor.module';
import { SensorDeviceModule } from './sensors/device/device-sensor.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    UsersModule,
    CommonModule,
    RealTimeDataModule,
    SensorSpecModule,
    SensorDeviceModule,
    ContDeviceModule,
    ContSpecModule,
    ContMapModule,
    NotificationsModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      useUTC: true,
      type: 'postgres',
      host: process.env[ENV_DB_HOST_KEY],
      port: parseInt(process.env[ENV_DB_PORT_KEY]),
      username: process.env[ENV_DB_USERNAME_KEY],
      password: process.env[ENV_DB_PASSWORD_KEY],
      database: process.env[ENV_DB_DATABASE_KEY],
      entities: [
        UsersModel,
        UsersLogModel,
        GatewaysModel,
        GatewaysGeneralLogModel,
        GatewaysConfigLogModel,
        SensorSpecModel,
        ContRealTimeDataModel,
        SensorRealTimeDataModel,
        SensorDeviceModel,
        DevicesModel,
        AccumulatedIrradianceModel,
        DailyAverageModel,
        FiveMinutesAverageModel,
        MonthlyAverageModel,
        ContSpecStepModel,
        ContSpecModel,
        ContDeviceModel,
        ContMapModel,
      ],
      synchronize: true,
    }),
    GatewaysModule,
    DevicesModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
