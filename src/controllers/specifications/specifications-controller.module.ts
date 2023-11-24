import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContSpecModel } from './entities/specifications-controller.entity';
import { ContSpecStepModel } from './entities/specifications-step.entity';
import { CommonModule } from 'src/common/common.module';
import { DevicesModule } from 'src/devices/devices.module';
import { ContSpecService } from './specifications-controller.service';
import { ContSpecController } from './specifications-controller.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContSpecModel, ContSpecStepModel]),
    CommonModule,
    DevicesModule,
  ],
  exports: [ContSpecService],
  controllers: [ContSpecController],
  providers: [ContSpecService],
})
export class ContSpecModule {}
