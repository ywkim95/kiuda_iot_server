import { PartialType } from '@nestjs/mapped-types';
import { CreateSensorSpecificationsDto } from './create-specifications-sensor.dto';

export class UpdateSensorSpecificationsDto extends PartialType(
  CreateSensorSpecificationsDto,
) {}
