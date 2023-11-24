import { PartialType } from '@nestjs/mapped-types';
import { CreateSensorDeviceDto } from './create-device-sensor.dto';

export class UpdateSensorDeviceDto extends PartialType(CreateSensorDeviceDto) {}
