import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseLogModel } from 'src/common/entity/base-log.entity';
import { ContSpecModel } from 'src/controllers/specifications/entities/specifications-controller.entity';
import { DevicesModel } from 'src/devices/entities/device.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class ContDeviceLogModel extends BaseLogModel {
  @ManyToOne(() => DevicesModel)
  @JoinColumn()
  device: DevicesModel;

  @Column({ comment: '기존 장비 명' })
  @IsString()
  name: string;

  @Column({ comment: '기존 변수 명' })
  @IsString()
  varName: string;

  @Column({ comment: '기존 설치위치' })
  @IsString()
  @IsOptional()
  location?: string;

  @Column({ comment: '기존 사용유무', default: true })
  @IsBoolean()
  useYn: boolean;

  // 제원
  @ManyToOne(() => ContSpecModel)
  @JoinColumn()
  specification: ContSpecModel;

  // 매핑된 센서의 아이디
  @Column({ comment: '기존 매핑된 센서의 아이디' })
  @IsNumber()
  mappingSensorId: number;

  // 연결된 디바이스의 아이디 (센서리스트가 포함되어있는 디바이스)
  @Column({
    comment:
      '기존 연결된 디바이스의 아이디 (센서리스트가 포함되어있는 디바이스)',
  })
  @IsNumber()
  connectedDeviceId: number;
}
