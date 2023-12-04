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

  @Column({ type: 'date', comment: '데이터 기록 날짜' })
  date: string;

  @Column({ comment: '데이터 수' })
  @IsNumber()
  dataCount: number;

  @Column({ comment: '누적 일사량' })
  @IsNumber()
  accumulatedIrradiance: number;

  // 해당 센서디바이스의 아이디
  @Column({ comment: '해당 디바이스 아이디' })
  @IsNumber()
  deviceId: number;
}
