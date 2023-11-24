import { PickType } from '@nestjs/mapped-types';
import { DevicesModel } from 'src/devices/entities/device.entity';

export class UpdateAlarmRangeAndCalibrateDto extends PickType(DevicesModel, [
  'sensors',
  'id',
  'clientId',
]) {}
