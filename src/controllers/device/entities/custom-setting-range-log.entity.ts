import { BaseLogModel } from 'src/common/entity/base-log.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ContDeviceModel } from './devices-controller.entity';
import { IsNumber } from 'class-validator';

@Entity()
export class CustomSettingRangeLogModel extends BaseLogModel {
  @Column({ comment: '기존 제어기 동작 범위 시작' })
  @IsNumber()
  sensorRangeStart: number;

  @Column({ comment: '기존 제어기 동작 범위 종료' })
  @IsNumber()
  sensorRangeEnd: number;

  @Column({ comment: '기존 제어기 값' })
  @IsNumber()
  controllerValue: number;

  @ManyToOne(() => ContDeviceModel, (model) => model.customSettingRanges)
  contDevice: ContDeviceModel;
}
