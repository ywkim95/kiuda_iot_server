import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContSpecModel } from './entities/specifications-controller.entity';
import { ContSpecStepModel } from './entities/specifications-step.entity';
import { CommonModule } from 'src/common/common.module';
import { DevicesModule } from 'src/devices/devices.module';
import { ContSpecService } from './specifications-controller.service';
import { ContSpecController } from './specifications-controller.controller';
import { ContSpecLogModel } from './entities/specifications-log.entity';
import { ContSpecStepLogModel } from './entities/specifications-step-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContSpecModel,
      ContSpecStepModel,
      ContSpecLogModel,
      ContSpecStepLogModel,
    ]),
    CommonModule,
  ],
  exports: [ContSpecService],
  controllers: [ContSpecController],
  providers: [ContSpecService],
})
export class ContSpecModule {}
