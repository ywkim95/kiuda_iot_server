import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseWithUpdateModel } from '../../common/entity/base-with-update.entity';
import { UsersModel } from '../../users/entity/users.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { DevicesModel } from '../../devices/entities/device.entity';
import { formatStringAsThreeDigit } from '../const/format-string-as-three-digit.const';

@Entity()
export class GatewaysModel extends BaseWithUpdateModel {
  @ManyToOne(() => UsersModel, (user) => user.gateways)
  owner: UsersModel;
  // where__onwer_email__i_like
  // where / onwer_email / i_like
  // onwer_email -> onwer: { email: }
  // const field_list = fields.split('_');
  // if(field_list.length === 1) a~~~~
  // else b~~~~

  @Column({ comment: '국가아이디' })
  @IsString()
  countryId: string;

  @Column({ comment: '지역아이디' })
  @IsString()
  areaId: string;

  @Column({ comment: '게이트웨이아이디' })
  @IsString()
  gatewayId: string;

  @Column({ nullable: true, comment: '설치위치' })
  @IsString()
  @IsOptional()
  location?: string;

  @Column({ nullable: true, comment: '게이트웨이 명' })
  @IsString()
  @IsOptional()
  name?: string;

  @Column({ nullable: true, comment: '설명' })
  @IsString()
  @IsOptional()
  description?: string;

  @Column({ comment: '주파수' })
  @IsNumber()
  frequency: number;

  @Column({ comment: 'TXPower' })
  @IsNumber()
  txPower: number;

  @Column({ comment: 'RFConfig' })
  @IsNumber()
  rfConfig: number;

  @Column({ comment: '게이트웨이에 속한 장비 자동증가 번호', default: 1 })
  @IsNumber()
  gatewayIdInc: number;

  @Column({ nullable: true, comment: '제어기 제어 스크립트' })
  @IsString()
  @IsOptional()
  controlScript?: string;

  @Column({ comment: '와이파이 아이디' })
  @IsString()
  ssid: string;

  @Column({ comment: '와이파이 비밀번호' })
  @IsString()
  ssidPassword: string;

  @Column({ default: false, comment: '리셋 여부' })
  @IsBoolean()
  resetYn: boolean;

  @Column({ nullable: true, comment: '마지막 PK 변경 여부' })
  @IsDate()
  @IsOptional()
  lastPkUpdateDate?: Date;

  @Column({ default: true, comment: '사용 유무' })
  @IsBoolean()
  useYn: boolean;

  @OneToMany(() => DevicesModel, (device) => device.gateway)
  devices: DevicesModel[];

  @BeforeInsert()
  @BeforeUpdate()
  formatFields() {
    this.countryId = formatStringAsThreeDigit(this.countryId);
    this.areaId = formatStringAsThreeDigit(this.areaId);
    this.gatewayId = formatStringAsThreeDigit(this.gatewayId);
  }
}
