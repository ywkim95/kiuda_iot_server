import { PickType } from '@nestjs/mapped-types';
import { DevicesModel } from '../entities/device.entity';
import { IsNumber } from 'class-validator';

export class CreateDeviceDto extends PickType(DevicesModel, [
  'name',
  'description',
  'location',
  'classify',
  'pkUpdateDate',
  'resetYn',
  'useYn',
  'statusCode',
  'clientId',
  'gateway',
]) {}
