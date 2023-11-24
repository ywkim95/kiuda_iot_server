import { BaseWithUpdateModel } from 'src/common/entity/base-with-update.entity';
import { DevicesModel } from 'src/devices/entities/device.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ContSpecModel } from '../../specifications/entities/specifications-controller.entity';
import { IsNumber, IsString } from 'class-validator';
import { ContMapModel } from '../../mappings/entities/mappings-controller.entity';

@Entity()
export class ContDeviceModel extends BaseWithUpdateModel {
  @ManyToOne(() => DevicesModel, (device) => device.controllers)
  device: DevicesModel;

  @ManyToOne(() => ContSpecModel)
  spec: ContSpecModel;

  @Column({ comment: '연계 센서 명' })
  @IsString()
  sensor: string;

  @Column({ comment: '제어 동작 값' })
  @IsNumber()
  manualValue: number;

  @Column({ comment: '제어 편차' })
  @IsNumber()
  gab: number;

  @Column({ comment: '사용자 설명' })
  @IsString()
  memo: string;

  @OneToMany(() => ContMapModel, (mapping) => mapping.deviceController)
  mappings: ContMapModel[];
}
