import { FindManyOptions, FindOptionsRelations } from 'typeorm';
import { ContDeviceModel } from '../entities/devices-controller.entity';

export const devicesControllerOptions: FindOptionsRelations<ContDeviceModel> = {
  customSettingRanges: true,
  specification: true,
  userCustomValues: true,
  device: true,
};
