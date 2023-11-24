import { Column, Entity } from 'typeorm';
import { RealTimeDataBaseModel } from './real-time-base.entity';
import { IsNumber, IsOptional } from 'class-validator';

@Entity()
export class SensorRealTimeDataModel extends RealTimeDataBaseModel {
  @Column({ nullable: true, comment: '센서 값 1' })
  @IsNumber()
  @IsOptional()
  s1?: number;

  @Column({ nullable: true, comment: '센서 값 2' })
  @IsNumber()
  @IsOptional()
  s2?: number;

  @Column({ nullable: true, comment: '센서 값 3' })
  @IsNumber()
  @IsOptional()
  s3?: number;

  @Column({ nullable: true, comment: '센서 값 4' })
  @IsNumber()
  @IsOptional()
  s4?: number;

  @Column({ nullable: true, comment: '센서 값 5' })
  @IsNumber()
  @IsOptional()
  s5?: number;

  @Column({ nullable: true, comment: '센서 값 6' })
  @IsNumber()
  @IsOptional()
  s6?: number;

  @Column({ nullable: true, comment: '센서 값 7' })
  @IsNumber()
  @IsOptional()
  s7?: number;

  @Column({ nullable: true, comment: '센서 값 8' })
  @IsNumber()
  @IsOptional()
  s8?: number;

  @Column({ nullable: true, comment: '센서 값 9' })
  @IsNumber()
  @IsOptional()
  s9?: number;

  @Column({ nullable: true, comment: '센서 값 10' })
  @IsNumber()
  @IsOptional()
  s10?: number;

  @Column({ nullable: true, comment: '센서 값 11' })
  @IsNumber()
  @IsOptional()
  s11?: number;

  @Column({ nullable: true, comment: '센서 값 12' })
  @IsNumber()
  @IsOptional()
  s12?: number;

  @Column({ nullable: true, comment: '센서 값 13' })
  @IsNumber()
  @IsOptional()
  s13?: number;

  @Column({ nullable: true, comment: '센서 값 14' })
  @IsNumber()
  @IsOptional()
  s14?: number;

  @Column({ nullable: true, comment: '센서 값 15' })
  @IsNumber()
  @IsOptional()
  s15?: number;

  @Column({ nullable: true, comment: '센서 값 16' })
  @IsNumber()
  @IsOptional()
  s16?: number;

  @Column({ nullable: true, comment: '센서 값 17' })
  @IsNumber()
  @IsOptional()
  s17?: number;

  @Column({ nullable: true, comment: '센서 값 18' })
  @IsNumber()
  @IsOptional()
  s18?: number;

  @Column({ nullable: true, comment: '센서 값 19' })
  @IsNumber()
  @IsOptional()
  s19?: number;

  @Column({ nullable: true, comment: '센서 값 20' })
  @IsNumber()
  @IsOptional()
  s20?: number;
}
