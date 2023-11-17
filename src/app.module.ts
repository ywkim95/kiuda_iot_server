import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { SensorsModule } from './gateways/sensors/sensors.module';
import { ControllersModule } from './gateways/controllers/controllers.module';
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

@Module({
  imports: [
    UsersModule,
    CommonModule,
    SensorsModule,
    ControllersModule,
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
      ],
      synchronize: true,
    }),
    GatewaysModule,
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
