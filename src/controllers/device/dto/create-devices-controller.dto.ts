import { PickType } from '@nestjs/mapped-types';
import { ContDeviceModel } from '../entities/devices-controller.entity';

export class CreateContDeviceDto extends PickType(ContDeviceModel, [
  'device',
  'spec',
  'sensor',
  'manualValue',
  'gab',
  'memo',
]) {}
