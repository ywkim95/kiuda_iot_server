import { Module } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { GatewaysController } from './gateways.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewaysModel } from './entities/gateway.entity';
import { GatewaysGeneralLogModel } from './entities/gateway-general-log.entity';
import { GatewaysConfigLogModel } from './entities/gateway-config-log.entity';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { RealTimeGateway } from '../devices/sensors/real-time/real-time.gateway';
import { DevicesModule } from 'src/devices/devices.module';
import { DevicesModel } from 'src/devices/entities/device.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GatewaysModel,
      GatewaysGeneralLogModel,
      GatewaysConfigLogModel,
    ]),
    CommonModule,
    AuthModule,
    UsersModule,
  ],
  exports: [GatewaysService],
  controllers: [GatewaysController],
  providers: [GatewaysService],
})
export class GatewaysModule {}
