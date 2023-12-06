import { BaseLogModel } from '../../../common/entity/base-log.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ContDeviceModel } from './devices-controller.entity';
import { IsNumber } from 'class-validator';

@Entity()
export class CustomSettingRangeLogModel extends BaseLogModel {
  @Column({ type: 'double precision', comment: '기존 제어기 동작 범위 시작' })
  @IsNumber()
  sensorRangeStart: number;

  @Column({ type: 'double precision', comment: '기존 제어기 동작 범위 종료' })
  @IsNumber()
  sensorRangeEnd: number;

  @Column({ type: 'double precision', comment: '기존 제어기 값' })
  @IsNumber()
  controllerValue: number;

  @Column({ comment: '기존 제어기 아이디' })
  contDeviceId: number;
}
