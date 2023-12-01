import { IsNumber } from 'class-validator';
import { BaseWithUpdateModel } from 'src/common/entity/base-with-update.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ContDeviceModel } from './devices-controller.entity';

@Entity()
export class CustomSettingRangeModel extends BaseWithUpdateModel {
  @Column({ comment: '제어기 동작 범위 시작' })
  @IsNumber()
  sensorRangeStart: number;

  @Column({ comment: '제어기 동작 범위 종료' })
  @IsNumber()
  sensorRangeEnd: number;

  @Column({ comment: '제어기 값' })
  @IsNumber()
  controllerValue: number;

  @ManyToOne(() => ContDeviceModel, (model) => model.customSettingRanges)
  contDevice: ContDeviceModel;
}
