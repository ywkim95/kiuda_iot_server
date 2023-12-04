import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseWithUpdateModel } from '../../../common/entity/base-with-update.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ContDeviceModel } from './devices-controller.entity';

@Entity()
export class UserCustomValueModel extends BaseWithUpdateModel {
  @Column({ comment: '제어 동작 값' })
  @IsNumber()
  manualValue: number;

  @Column({ comment: '제어 편차', default: 0 })
  @IsNumber()
  gab: number;

  @Column({ nullable: true, comment: '사용자 설명' })
  @IsString()
  @IsOptional()
  memo: string;

  @ManyToOne(() => ContDeviceModel, (model) => model.userCustomValues)
  contDevice: ContDeviceModel;
}
