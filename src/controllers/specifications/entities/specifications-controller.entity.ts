import { BaseWithUpdateModel } from 'src/common/entity/base-with-update.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ContTypeEnum } from '../const/controller-type.enum';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ContSpecStepModel } from './specifications-step.entity';

@Entity()
export class ContSpecModel extends BaseWithUpdateModel {
  @Column({ comment: '제어기 명' })
  @IsString()
  name: string;

  @Column({ comment: '변수 명' })
  @IsString()
  varName: string;

  @Column({ comment: '제어기 구분' })
  @IsEnum(ContTypeEnum)
  controllerType: ContTypeEnum;

  @OneToMany(() => ContSpecStepModel, (step) => step.specification)
  specificationSteps: ContSpecStepModel[];

  @Column({ nullable: true, comment: '설명' })
  @IsString()
  @IsOptional()
  description?: string;

  @Column({ comment: '단위' })
  @IsString()
  unit: string;

  @Column({ comment: '최소 값', default: 0 })
  @IsNumber()
  @IsOptional()
  min?: number;

  @Column({ comment: '최대 값', default: 1 })
  @IsNumber()
  @IsOptional()
  max?: number;

  @Column({ comment: '증감 단위', default: 1 })
  @IsNumber()
  @IsOptional()
  step?: number;

  @Column({ comment: '사용 유무', default: true })
  @IsBoolean()
  @IsOptional()
  useYn?: boolean;
}
