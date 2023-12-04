import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseLogModel } from '../../../common/entity/base-log.entity';
import { stringValidationMessage } from '../../../common/validation-message/string-validation.message';
import { Column, Entity } from 'typeorm';

@Entity()
export class SensorSpecLogModel extends BaseLogModel {
  @Column({ comment: '기존 센서 명' })
  @IsString({
    message: stringValidationMessage,
  })
  name: string;

  @Column({ nullable: true, comment: '기존 변수 명' })
  @IsString({
    message: stringValidationMessage,
  })
  @IsOptional()
  varName?: string;

  @Column({ nullable: true, comment: '기존 설명' })
  @IsString({
    message: stringValidationMessage,
  })
  @IsOptional()
  description?: string;

  @Column({ comment: '기존 모델정보' })
  @IsString({
    message: stringValidationMessage,
  })
  model: string;

  @Column({ comment: '기존 제조사' })
  @IsString({
    message: stringValidationMessage,
  })
  manufacturer: string;

  @Column({ comment: '기존 소수점', default: 0 })
  @IsNumber()
  @IsOptional()
  decimalPlaces?: number;

  @Column({ nullable: true, comment: '기존 그래프 출력 모드' })
  @IsString({
    message: stringValidationMessage,
  })
  @IsOptional()
  graphMode?: string;

  @Column({ comment: '기존 사용 유무', default: true })
  @IsBoolean()
  @IsOptional()
  useYn: boolean;

  @Column({ comment: '기존 단위' })
  @IsString({
    message: stringValidationMessage,
  })
  unit: string;

  @Column({ comment: '기존 최소 값' })
  @IsNumber()
  minValue: number;

  @Column({ comment: '기존 최대 값' })
  @IsNumber()
  maxValue: number;

  @Column({ comment: '기존 경고-낮음-시작' })
  @IsNumber()
  lowWarningStart: number;

  @Column({ comment: '기존 경고-낮음-끝' })
  @IsNumber()
  lowWarningEnd: number;

  @Column({ comment: '기존 정상-시작' })
  @IsNumber()
  stableStart: number;

  @Column({ comment: '기존 정상-끝' })
  @IsNumber()
  stableEnd: number;

  @Column({ comment: '기존 경고-높음-시작' })
  @IsNumber()
  highWarningStart: number;

  @Column({ comment: '기존 경고-높음-끝' })
  @IsNumber()
  highWarningEnd: number;

  @Column({ comment: '기존 위험-시작' })
  @IsNumber()
  dangerStart: number;

  @Column({ comment: '기존 위험-끝' })
  @IsNumber()
  dangerEnd: number;
}
