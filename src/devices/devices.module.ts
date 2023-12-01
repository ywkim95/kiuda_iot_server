import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { GatewaysModule } from 'src/gateways/gateways.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesModel } from './entities/device.entity';
import { CommonModule } from 'src/common/common.module';
import { DevicesLogModel } from './entities/device-log.entity';

@Module({
  imports: [
    CommonModule,
    GatewaysModule,
    TypeOrmModule.forFeature([DevicesModel, DevicesLogModel]),
  ],
  exports: [DevicesService],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
//
