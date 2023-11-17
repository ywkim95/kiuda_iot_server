import { Column, ManyToOne } from 'typeorm';
import { GatewaysModel } from './gateway.entity';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';

export class GatewaysConfigLogModel extends BaseModel {
  @ManyToOne(() => GatewaysModel)
  @Column({ comment: '변경한 게이트웨이 ID' })
  dependencyGatewayId: GatewaysModel; // GatewaysModel의 id필드임 절대 gatewayId가 아님!

  @Column({ nullable: true, comment: '변경 전 국가 ID' })
  @IsNumber()
  oldCountryId?: number; // 변경 전의 국가 ID

  @Column({ nullable: true, comment: '변경 전 지역 ID' })
  @IsNumber()
  oldAreaId?: number; // 변경 전의 지역 ID

  @Column({ nullable: true, comment: '변경 전 게이트웨이 ID' })
  @IsNumber()
  oldGatewayId?: number; // 변경 전의 게이트웨이 ID

  @Column({ nullable: true, comment: '변경 전 주파수' })
  @IsNumber()
  oldFrequency?: number; // 변경 전의 주파수

  @Column({ nullable: true, comment: '변경 전 TxPower' })
  @IsNumber()
  oldTxPower?: number; // 변경 전의 전송 파워

  @Column({ nullable: true, comment: '변경 전 RFConfig' })
  @IsNumber()
  oldRfConfig?: number; // 변경 전의 RF 구성

  @Column({ nullable: true, comment: '변경 전 SSID' })
  @IsString()
  oldSsid?: string; // 변경 전의 SSID

  @Column({ nullable: true, comment: '변경 전 SSID 비밀번호' })
  @IsString()
  oldSsidPassword?: string; // 변경 전의 SSID 비밀번호

  @Column({ nullable: true, comment: '변경 전 사용 여부' })
  @IsBoolean()
  oldUseYn?: boolean; // 변경 전의 사용 여부

  @Column({ nullable: true, comment: '변경 전 리셋 여부' })
  @IsBoolean()
  oldResetYn?: boolean; // 변경 전의 리셋 여부
}
