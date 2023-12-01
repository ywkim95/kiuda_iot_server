import { PartialType } from '@nestjs/mapped-types';
import { CreateContDeviceDto } from './create-devices-controller.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateContDeviceDto extends PartialType(CreateContDeviceDto) {}
