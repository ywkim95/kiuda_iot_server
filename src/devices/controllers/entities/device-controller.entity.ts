import { BaseWithUpdateModel } from 'src/common/entity/base-with-update.entity';
import { DevicesModel } from 'src/devices/entities/device.entity';
import { Entity, ManyToOne } from 'typeorm';

@Entity()
export class DeviceControllersModel extends BaseWithUpdateModel {
  @ManyToOne(() => DevicesModel, (device) => device.controllers)
  device: DevicesModel;
}
