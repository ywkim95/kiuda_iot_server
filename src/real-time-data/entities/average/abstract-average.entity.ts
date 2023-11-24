import { IsDate, IsNumber, IsOptional } from 'class-validator';
import { DevicesModel } from 'src/devices/entities/device.entity';
import {
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export abstract class AbstractAverageModel {
  @PrimaryGeneratedColumn({ comment: '아이디' })
  id: number;

  @CreateDateColumn({ comment: '생성 일자' })
  createdAt: Date;

  @Column({ comment: '측정 시작 시간' })
  @IsDate()
  startDate: Date;

  @Column({ comment: '측정 종료 시간' })
  @IsDate()
  endDate: Date;

  @Column({ comment: '데이터 카운트' })
  @IsNumber()
  dataCount: number;

  @ManyToOne(() => DevicesModel)
  device: DevicesModel;

  @Column({ type: 'json', nullable: true, comment: '1번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s1?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '2번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s2?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '3번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s3?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '4번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s4?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '5번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s5?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '6번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s6?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '7번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s7?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '8번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s8?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '9번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s9?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '10번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s10?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '11번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s11?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '12번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s12?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '13번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s13?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '14번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s14?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '15번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s15?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '16번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s16?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '17번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s17?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '18번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s18?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '19번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s19?: {
    min: number;
    max: number;
    average: number;
  };

  @Column({ type: 'json', nullable: true, comment: '20번 평균데이터' })
  @IsNumber()
  @IsOptional()
  s20?: {
    min: number;
    max: number;
    average: number;
  };
}
