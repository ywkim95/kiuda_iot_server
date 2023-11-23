import { PickType } from '@nestjs/mapped-types';
import { RealTimeSensorsModel } from '../entities/real-time/real-time-sensor.entity';
import { IsString } from 'class-validator';

export class CreateRealTimeSensorsDto extends PickType(RealTimeSensorsModel, [
  's1',
  's2',
  's3',
  's4',
  's5',
  's6',
  's7',
  's8',
  's9',
  's10',
  's11',
  's12',
  's13',
  's14',
  's15',
  's16',
  's17',
  's18',
  's19',
  's20',
  'sqn',
  'rssi',
]) {
  @IsString()
  ghid: string;

  @IsString()
  glid: string;

  @IsString()
  gid: string;

  @IsString()
  cid: string;
}
