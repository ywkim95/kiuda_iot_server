import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceSensorDto } from './create-device-sensor.dto';

export class UpdateDeviceSensorDto extends PartialType(CreateDeviceSensorDto) {}
