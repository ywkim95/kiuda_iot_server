import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { GatewaysModule } from 'src/gateways/gateways.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesModel } from './entities/device.entity';
import { GatewaysModel } from 'src/gateways/entities/gateway.entity';
import { CommonModule } from 'src/common/common.module';
import { RealTimeController } from './sensors/real-time/real-time.controller';
import { SensorsModule } from './sensors/sensors.module';

@Module({
  imports: [
    CommonModule,
    GatewaysModule,
    TypeOrmModule.forFeature([DevicesModel]),
  ],
  exports: [DevicesService],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
//
