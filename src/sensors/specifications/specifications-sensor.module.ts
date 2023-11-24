import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorSpecModel } from './entities/specifications-sensor.entity';
import { SensorSpecService } from './specifications-sensor.service';
import { SensorSpecController } from './specifications-sensor.controller';
import { DevicesModule } from 'src/devices/devices.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SensorSpecModel]),
    DevicesModule,
    CommonModule,
  ],
  exports: [SensorSpecService],
  controllers: [SensorSpecController],
  providers: [SensorSpecService],
})
export class SensorSpecModule {}
