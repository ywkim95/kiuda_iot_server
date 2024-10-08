import { IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ActionEnum } from '../const/action-enum.const';

export abstract class BaseLogModel {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    comment: '기록 날짜',
  })
  @IsDate()
  recordedAt: Date;

  @Column({
    comment: '기록 이메일',
  })
  @IsString()
  recordedBy: string;

  @Column({ comment: '기록된 모델의 아이디' })
  @IsNumber()
  modelId: number;

  @Column({ comment: '수정/삭제 구분', default: ActionEnum.PATCH })
  @IsEnum(ActionEnum)
  actionType: ActionEnum;
}
