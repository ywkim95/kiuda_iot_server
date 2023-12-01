import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseLogModel } from 'src/common/entity/base-log.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { DeviceEnum } from '../const/deviceEnum.const';
import { GatewaysModel } from 'src/gateways/entities/gateway.entity';

@Entity()
export class DevicesLogModel extends BaseLogModel {
  @Column({
    comment: '기존 기기 명',
  })
  @IsString()
  name: string;

  // 실시간 데이터를 받기위한 매핑 아이디
  @Column({ comment: '기존 클라이언트 아이디' })
  @IsString()
  clientId: string;

  @Column({ comment: '기존 기기 설명', nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Column({ comment: '기존 기기 위치', nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  // 이거는 센서인지 제어기인지 구분하기위한 것
  @Column({ comment: '기존 구분', enum: DeviceEnum })
  @IsOptional()
  classify: DeviceEnum;

  @Column({ comment: '기존 해당 장비 초기화 설정' })
  @IsBoolean()
  resetYn: boolean;

  @Column({
    comment: '기존 pk 마지막 변경날짜(게이트웨이 변경시 날짜 최신화)',
    nullable: true,
  })
  @IsDate()
  @IsOptional()
  pkUpdateDate?: Date;

  @Column({ comment: '기존 사용 여부' })
  @IsBoolean()
  useYn: boolean;

  @Column({ comment: '기존 상태코드' })
  @IsNumber()
  statusCode: number;

  @ManyToOne(() => GatewaysModel)
  gateway: GatewaysModel;
}
