import { PickType } from '@nestjs/mapped-types';
import { DeviceSensorsModel } from '../entities/device-sensor.entity';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateDeviceSensorDto extends PickType(DeviceSensorsModel, [
  'correctionValue',
  'customStableEnd',
  'customStableStart',
  'name',
  'device',
  'spec',
]) {}
