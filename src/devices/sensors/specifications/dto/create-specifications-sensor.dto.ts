import { PickType } from '@nestjs/mapped-types';
import { SensorSpecificationsModel } from '../entities/specifications-sensor.entity';
import { IsBoolean, IsOptional } from 'class-validator';

export class CreateSensorSpecificationsDto extends PickType(
  SensorSpecificationsModel,
  [
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
  ],
) {}
