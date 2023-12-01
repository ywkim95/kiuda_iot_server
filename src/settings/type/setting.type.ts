import { ContDeviceModel } from 'src/controllers/device/entities/devices-controller.entity';
import { DevicesModel } from 'src/devices/entities/device.entity';
import { SensorDeviceModel } from 'src/sensors/device/entities/device-sensor.entity';

export type Setting = {
  controllerList: ContDeviceModel[];
  sensorList: SensorDeviceModel[];
  useYnList: DevicesModel[];
};
