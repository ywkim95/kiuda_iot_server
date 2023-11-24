import { PartialType } from '@nestjs/mapped-types';
import { CreateContDeviceDto } from './create-devices-controller.dto';

export class UpdateContDeviceDto extends PartialType(CreateContDeviceDto) {}
