import { PickType } from '@nestjs/mapped-types';
import { ContRealTimeDataModel } from '../entities/real-time/real-time-controller.entity';
import { IsString } from 'class-validator';

export class CreateRealTimeControllersDto extends PickType(
  ContRealTimeDataModel,
  ['rssi', 'sqn'],
) {
  @IsString()
  ghid: string;

  @IsString()
  glid: string;

  @IsString()
  gid: string;

  @IsString()
  cid: string;

  @IsString()
  gpio: string;
}
