import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNumber } from 'class-validator';

// 누적일사량
@Entity()
export class AccumulatedIrradianceModel {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ comment: '생성일자' })
  createdAt: Date;

  @Column({ comment: '데이터 수' })
  @IsNumber()
  dataCount: number;

  @Column({ comment: '누적 일사량' })
  @IsNumber()
  accumulatedIrradiance: number;
}
