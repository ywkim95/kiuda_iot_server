import { PartialType } from '@nestjs/mapped-types';
import { CreateSensorSpecDto } from './create-specifications-sensor.dto';

export class UpdateSensorSpecDto extends PartialType(CreateSensorSpecDto) {}
