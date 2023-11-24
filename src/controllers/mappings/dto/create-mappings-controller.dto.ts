import { PickType } from '@nestjs/mapped-types';
import { ContMapModel } from '../entities/mappings-controller.entity';

export class CreateContMapDto extends PickType(ContMapModel, [
  'label',
  'sensorRangeStart',
  'sensorRangeEnd',
  'gab',
  'useYn',
  'controllerValue',
  'deviceSensor',
  'deviceController',
]) {}
