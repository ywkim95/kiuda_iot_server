import { PickType } from '@nestjs/mapped-types';
import { RealTimeControllersModel } from '../entities/real-time-controller.entity';
import { IsString } from 'class-validator';

export class CreateRealTimeControllersDto extends PickType(
  RealTimeControllersModel,
  ['gpio1', 'gpio2', 'rssi', 'sqn'],
) {
  @IsString()
  ghid: string;

  @IsString()
  glid: string;

  @IsString()
  gid: string;

  @IsString()
  cid: string;
}
