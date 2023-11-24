import { BaseWithUpdateModel } from 'src/common/entity/base-with-update.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ContDeviceModel } from '../../device/entities/devices-controller.entity';
import { SensorDeviceModel } from 'src/sensors/device/entities/device-sensor.entity';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

@Entity()
export class ContMapModel extends BaseWithUpdateModel {
  @ManyToOne(() => ContDeviceModel, (device) => device.mappings)
  deviceController: ContDeviceModel;

  @ManyToOne(() => SensorDeviceModel, (device) => device.mappings)
  deviceSensor: SensorDeviceModel;

  @Column({ comment: '' })
  @IsString()
  label: string;

  @Column({ comment: '' })
  @IsNumber()
  sensorRangeStart: number;

  @Column({ comment: '' })
  @IsNumber()
  sensorRangeEnd: number;

  @Column({ comment: '' })
  @IsNumber()
  gab: number;

  @Column({ comment: '' })
  @IsNumber()
  controllerValue: number;

  @Column({ comment: '' })
  @IsBoolean()
  useYn: boolean;
}
