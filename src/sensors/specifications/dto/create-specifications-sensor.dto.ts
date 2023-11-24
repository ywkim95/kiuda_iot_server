import { PickType } from '@nestjs/mapped-types';
import { SensorSpecModel } from '../entities/specifications-sensor.entity';

export class CreateSensorSpecDto extends PickType(SensorSpecModel, [
  'name',
  'varName',
  'minValue',
  'maxValue',
  'stableStart',
  'stableEnd',
  'lowWarningStart',
  'lowWarningEnd',
  'highWarningStart',
  'highWarningEnd',
  'dangerStart',
  'dangerEnd',
  'model',
  'manufacturer',
  'unit',
  'decimalPlaces',
  'graphMode',
  'description',
]) {}
