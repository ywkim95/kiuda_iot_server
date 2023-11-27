import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseWithUpdateModel } from '../../../common/entity/base-with-update.entity';
import { stringValidationMessage } from '../../../common/validation-message/string-validation.message';
import { Column, Entity } from 'typeorm';

@Entity()
export class SensorSpecModel extends BaseWithUpdateModel {
  // 제원인데 왜 유저가 필요하지?
  // @ManyToOne(() => UsersModel)
  // user: UsersModel;

  @Column({ comment: '센서 명' })
  @IsString({
    message: stringValidationMessage,
  })
  name: string;

  @Column({ nullable: true, comment: '변수 명' })
  @IsString({
    message: stringValidationMessage,
  })
  @IsOptional()
  varName?: string;

  @Column({ nullable: true, comment: '설명' })
  @IsString({
    message: stringValidationMessage,
  })
  @IsOptional()
  description?: string;

  @Column({ comment: '모델정보' })
  @IsString({
    message: stringValidationMessage,
  })
  model: string;

  @Column({ comment: '제조사' })
  @IsString({
    message: stringValidationMessage,
  })
  manufacturer: string;

  @Column({ comment: '소수점', default: 0 })
  @IsNumber()
  @IsOptional()
  decimalPlaces?: number;

  @Column({ nullable: true, comment: '그래프 출력 모드' })
  @IsString({
    message: stringValidationMessage,
  })
  @IsOptional()
  graphMode?: string;

  @Column({ comment: '사용 유무', default: true })
  @IsBoolean()
  @IsOptional()
  useYn: boolean;

  @Column({ comment: '단위' })
  @IsString({
    message: stringValidationMessage,
  })
  unit: string;

  @Column({ comment: '최소 값' })
  @IsNumber()
  minValue: number;

  @Column({ comment: '최대 값' })
  @IsNumber()
  maxValue: number;

  @Column({ comment: '경고-낮음-시작' })
  @IsNumber()
  lowWarningStart: number;

  @Column({ comment: '경고-낮음-끝' })
  @IsNumber()
  lowWarningEnd: number;

  @Column({ comment: '정상-시작' })
  @IsNumber()
  stableStart: number;

  @Column({ comment: '정상-끝' })
  @IsNumber()
  stableEnd: number;

  @Column({ comment: '경고-높음-시작' })
  @IsNumber()
  highWarningStart: number;

  @Column({ comment: '경고-높음-끝' })
  @IsNumber()
  highWarningEnd: number;

  @Column({ comment: '위험-시작' })
  @IsNumber()
  dangerStart: number;

  @Column({ comment: '위험-끝' })
  @IsNumber()
  dangerEnd: number;
}
