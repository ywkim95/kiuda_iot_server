import { Column, Entity } from 'typeorm';
import { RealTimeDataBaseModel } from './real-time-base.entity';
import { IsOptional, IsString } from 'class-validator';

@Entity()
export class ContRealTimeDataModel extends RealTimeDataBaseModel {
  @Column({ nullable: true, comment: 'gpio 1' })
  @IsString()
  @IsOptional()
  gpio1?: string;

  @Column({ nullable: true, comment: 'gpio 2' })
  @IsString()
  @IsOptional()
  gpio2?: string;
}
