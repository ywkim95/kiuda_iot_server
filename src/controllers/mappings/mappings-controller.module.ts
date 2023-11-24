import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContMapModel } from './entities/mappings-controller.entity';
import { DevicesModule } from 'src/devices/devices.module';
import { CommonModule } from 'src/common/common.module';
import { ContMapController } from './mappings-controller.controller';
import { ContMapService } from './mappings-controller.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContMapModel]),
    DevicesModule,
    CommonModule,
  ],
  exports: [ContMapService],
  controllers: [ContMapController],
  providers: [ContMapService],
})
export class ContMapModule {}
