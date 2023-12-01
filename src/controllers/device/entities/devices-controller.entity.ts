import { BaseWithUpdateModel } from '../../../common/entity/base-with-update.entity';
import { DevicesModel } from '../../../devices/entities/device.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ContSpecModel } from '../../specifications/entities/specifications-controller.entity';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { CustomSettingRangeModel } from './custom-setting-range.entity';
import { UserCustomValueModel } from './user-custom-value.entity';

// 실제 등록할 디바이스

@Entity()
export class ContDeviceModel extends BaseWithUpdateModel {
  @ManyToOne(() => DevicesModel, (device) => device.controllers)
  @JoinColumn()
  device: DevicesModel;

  @Column({ comment: '장비 명' })
  @IsString()
  name: string;

  @Column({ comment: '변수 명' })
  @IsString()
  varName: string;

  @Column({ comment: '설치위치' })
  @IsString()
  @IsOptional()
  location?: string;

  @Column({ comment: '사용유무', default: true })
  @IsBoolean()
  useYn: boolean;

  // 제원
  @ManyToOne(() => ContSpecModel)
  @JoinColumn()
  specification: ContSpecModel;

  // 매핑된 센서의 아이디
  @Column({ comment: '매핑된 센서의 아이디' })
  @IsNumber()
  mappingSensorId: number;

  // 연결된 디바이스의 아이디 (센서리스트가 포함되어있는 디바이스)
  @Column({
    comment: '연결된 디바이스의 아이디 (센서리스트가 포함되어있는 디바이스)',
  })
  @IsNumber()
  connectedDeviceId: number;

  // 제어기 동작에 대한 설정된 범위
  @OneToMany(() => CustomSettingRangeModel, (model) => model.contDevice)
  customSettingRanges: CustomSettingRangeModel[];

  // 유저가 설정한 센서 값
  @OneToMany(() => UserCustomValueModel, (model) => model.contDevice)
  userCustomValues: UserCustomValueModel[];
}
