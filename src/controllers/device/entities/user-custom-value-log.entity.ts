import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseLogModel } from '../../../common/entity/base-log.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ContDeviceModel } from './devices-controller.entity';

@Entity()
export class UserCustomValueLogModel extends BaseLogModel {
  @Column({ type: 'double precision', comment: '기존 제어 동작 값' })
  @IsNumber()
  manualValue: number;

  @Column({ type: 'double precision', comment: '기존 제어 편차' })
  @IsNumber()
  gab: number;

  @Column({ nullable: true, comment: '기존 사용자 설명' })
  @IsString()
  @IsOptional()
  memo: string;

  @Column({ comment: '기존 제어기 아이디' })
  contDeviceId: number;
}
