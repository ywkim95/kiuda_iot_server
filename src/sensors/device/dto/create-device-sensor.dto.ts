import { PickType } from '@nestjs/mapped-types';
import { SensorDeviceModel } from '../entities/device-sensor.entity';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateSensorDeviceDto extends PickType(SensorDeviceModel, [
  'correctionValue',
  'customStableEnd',
  'customStableStart',
  'name',
  'device',
  'spec',
]) {}
