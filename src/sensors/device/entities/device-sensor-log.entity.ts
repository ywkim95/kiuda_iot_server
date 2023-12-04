import { IsNumber, IsString } from 'class-validator';
import { BaseLogModel } from '../../../common/entity/base-log.entity';
import { DevicesModel } from '../../../devices/entities/device.entity';
import { SensorSpecModel } from '../../../sensors/specifications/entities/specifications-sensor.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class SensorDeviceLogModel extends BaseLogModel {
  @ManyToOne(() => DevicesModel)
  device: DevicesModel;

  @ManyToOne(() => SensorSpecModel)
  spec: SensorSpecModel;

  @Column({ comment: '기존 보정 값' })
  @IsNumber()
  correctionValue: number;

  @Column({ comment: '기존 장비 명' })
  @IsString()
  name: string;

  @Column({ comment: '기존 범위 시작' })
  @IsNumber()
  customStableStart: number;

  @Column({ comment: '기존 범위 끝' })
  @IsNumber()
  customStableEnd: number;
}
