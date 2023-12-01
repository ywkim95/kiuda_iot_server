import { BaseLogModel } from 'src/common/entity/base-log.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ContSpecModel } from './specifications-controller.entity';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

@Entity()
export class ContSpecStepLogModel extends BaseLogModel {
  @ManyToOne(() => ContSpecModel)
  specification: ContSpecModel;

  @Column({ comment: '기존 값' })
  @IsNumber()
  value: number;

  @Column({ comment: '기존 라벨' })
  @IsString()
  label: string;

  @Column({ comment: '기존 사용 유무' })
  @IsBoolean()
  useYn: boolean;
}
