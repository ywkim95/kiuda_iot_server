import { Column, Entity } from 'typeorm';
import { RealTimeBaseModel } from './real-time-base.entity';
import { IsOptional, IsString } from 'class-validator';

@Entity()
export class RealTimeControllersModel extends RealTimeBaseModel {
  @Column({ nullable: true, comment: 'gpio 1' })
  @IsString()
  @IsOptional()
  gpio1?: string;

  @Column({ nullable: true, comment: 'gpio 2' })
  @IsString()
  @IsOptional()
  gpio2?: string;
}
