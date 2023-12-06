import { BaseLogModel } from '../../common/entity/base-log.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';
import { formatStringAsThreeDigit } from '../const/format-string-as-three-digit.const';
import { UsersModel } from '../../users/entity/users.entity';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

@Entity()
export class GatewaysLogModel extends BaseLogModel {
  @ManyToOne(() => UsersModel, (user) => user.gateways)
  owner: UsersModel;

  @Column({ comment: '기존 국가아이디' })
  @IsString()
  countryId: string;

  @Column({ comment: '기존 지역아이디' })
  @IsString()
  areaId: string;

  @Column({ comment: '기존 게이트웨이아이디' })
  @IsString()
  gatewayId: string;

  @Column({ nullable: true, comment: '기존 설치위치' })
  @IsString()
  @IsOptional()
  location?: string;

  @Column({ nullable: true, comment: '기존 게이트웨이 명' })
  @IsString()
  @IsOptional()
  name?: string;

  @Column({ nullable: true, comment: '기존 설명' })
  @IsString()
  @IsOptional()
  description?: string;

  @Column({ type: 'double precision', comment: '기존 주파수' })
  @IsNumber()
  frequency: number;

  @Column({ type: 'double precision', comment: '기존 TXPower' })
  @IsNumber()
  txPower: number;

  @Column({ type: 'double precision', comment: '기존 RFConfig' })
  @IsNumber()
  rfConfig: number;

  @Column({ comment: '기존 게이트웨이에 속한 장비 자동증가 번호', default: 1 })
  @IsNumber()
  gatewayIdInc: number;

  @Column({ nullable: true, comment: '기존 제어기 제어 스크립트' })
  @IsString()
  @IsOptional()
  controlScript?: string;

  @Column({ comment: '기존 와이파이 아이디' })
  @IsString()
  ssid: string;

  @Column({ comment: '기존 와이파이 비밀번호' })
  @IsString()
  ssidPassword: string;

  @Column({ default: false, comment: '기존 리셋 여부' })
  @IsBoolean()
  resetYn: boolean;

  @Column({ nullable: true, comment: '기존 마지막 PK 변경 여부' })
  @IsDate()
  @IsOptional()
  lastPkUpdateDate?: Date;

  @Column({ default: true, comment: '기존 사용 유무' })
  @IsBoolean()
  useYn: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  formatFields() {
    this.countryId = formatStringAsThreeDigit(this.countryId);
    this.areaId = formatStringAsThreeDigit(this.areaId);
    this.gatewayId = formatStringAsThreeDigit(this.gatewayId);
  }
}
