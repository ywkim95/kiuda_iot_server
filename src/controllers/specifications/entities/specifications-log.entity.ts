import { Column, Entity } from 'typeorm';
import { ContTypeEnum } from '../const/controller-type.enum';
import { BaseLogModel } from 'src/common/entity/base-log.entity';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';

@Entity()
export class ContSpecLogModel extends BaseLogModel {
  @Column({ comment: '기존 제어기 명' })
  @IsString()
  name: string;

  @Column({ comment: '기존 변수 명' })
  @IsString()
  varName: string;

  @Column({ comment: '기존 제어기 구분' })
  @IsEnum(ContTypeEnum)
  controllerType: ContTypeEnum;

  @Column({ comment: '기존 설명' })
  @IsString()
  description?: string;

  @Column({ comment: '기존 단위' })
  @IsString()
  unit: string;

  @Column({ comment: '기존 최소 값' })
  @IsNumber()
  min?: number;

  @Column({ comment: '기존 최대 값' })
  @IsNumber()
  max?: number;

  @Column({ comment: '기존 증감 단위' })
  @IsNumber()
  step?: number;

  @Column({ comment: '기존 사용 유무' })
  @IsBoolean()
  useYn: boolean;
}
