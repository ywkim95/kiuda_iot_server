import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseWithUpdateModel } from '../../common/entity/base-with-update.entity';
import { GatewaysModel } from '../../gateways/entities/gateway.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { SensorDeviceModel } from '../../sensors/device/entities/device-sensor.entity';
import { DeviceEnum } from '../const/deviceEnum.const';
import { ContDeviceModel } from '../../controllers/device/entities/devices-controller.entity';

@Entity()
export class DevicesModel extends BaseWithUpdateModel {
  @Column({
    unique: true,
    comment: '기기 명',
  })
  @IsString()
  name: string;

  // 실시간 데이터를 받기위한 매핑 아이디
  @Column({ comment: '클라이언트 아이디' })
  @IsString()
  clientId: string;

  @Column({ comment: '기기 설명', nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Column({ comment: '기기 위치', nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  // 이거는 센서인지 제어기인지 구분하기위한 것
  @Column({ comment: '구분', enum: DeviceEnum, default: DeviceEnum.SENSOR })
  @IsOptional()
  classify: DeviceEnum;

  @Column({ comment: '해당 장비 초기화 설정', default: false })
  @IsBoolean()
  @IsOptional()
  resetYn: boolean;

  @Column({
    comment: 'pk 마지막 변경날짜(게이트웨이 변경시 날짜 최신화)',
    nullable: true,
  })
  @IsDate()
  @IsOptional()
  pkUpdateDate?: Date;

  @Column({ comment: '사용 여부', default: false })
  @IsBoolean()
  useYn: boolean;

  @Column({ comment: '상태코드', default: 0 })
  @IsNumber()
  statusCode: number;

  @ManyToOne(() => GatewaysModel, (gateway) => gateway.devices)
  gateway: GatewaysModel;

  @OneToMany(() => SensorDeviceModel, (sensors) => sensors.device)
  sensors: SensorDeviceModel[];

  @OneToMany(() => ContDeviceModel, (controllers) => controllers.device)
  controllers: ContDeviceModel[];
}
