import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseLogModel } from 'src/common/entity/base-log.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ContDeviceModel } from './devices-controller.entity';

@Entity()
export class UserCustomValueLogModel extends BaseLogModel {
  @Column({ comment: '기존 제어 동작 값' })
  @IsNumber()
  manualValue: number;

  @Column({ comment: '기존 제어 편차' })
  @IsNumber()
  gab: number;

  @Column({ nullable: true, comment: '기존 사용자 설명' })
  @IsString()
  @IsOptional()
  memo: string;

  @ManyToOne(() => ContDeviceModel, (model) => model.userCustomValues)
  contDevice: ContDeviceModel;
}
