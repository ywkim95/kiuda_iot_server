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

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @IsNumber()
  dataCount: number;

  @Column()
  @IsNumber()
  accumulatedIrradiance: number;
}
