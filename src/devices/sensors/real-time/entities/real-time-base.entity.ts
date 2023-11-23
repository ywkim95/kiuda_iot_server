import { IsNumber } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DevicesModel } from 'src/devices/entities/device.entity';
// 이걸로 가도될듯?
export abstract class RealTimeBaseModel {
  @PrimaryGeneratedColumn({ comment: '아이디' })
  id: number;

  @CreateDateColumn({ comment: '생성일자' })
  createdAt: Date;

  @ManyToOne(() => DevicesModel)
  device: DevicesModel;

  @Column({ comment: 'rssi 신호값' })
  @IsNumber()
  rssi: number;

  @Column({ comment: 'sqn' })
  @IsNumber()
  sqn: number;
}
