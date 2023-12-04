import { BadRequestException, Injectable } from '@nestjs/common';
import { ContDeviceService } from 'src/controllers/device/device-controller.service';
import { DevicesService } from 'src/devices/devices.service';
import { GatewaysService } from 'src/gateways/gateways.service';
import { SensorDeviceService } from 'src/sensors/device/device-sensor.service';
import { Setting } from './type/setting.type';
import { UsersModel } from 'src/users/entity/users.entity';
import { isEqual } from 'lodash';
import { ContDeviceModel } from 'src/controllers/device/entities/devices-controller.entity';
import { SensorDeviceModel } from 'src/sensors/device/entities/device-sensor.entity';
import { DevicesModel } from 'src/devices/entities/device.entity';

type modelList = ContDeviceModel[] | SensorDeviceModel[] | DevicesModel[];

@Injectable()
export class SettingsService {
  constructor(
    private readonly contDeviceService: ContDeviceService,
    private readonly sensorDeviceService: SensorDeviceService,
    private readonly devicesService: DevicesService,
  ) {}

  /**
   * 필요한 내용은
   * 알람범위&보정 수정과 제어기 전체값변경, 센서/제어기 사용유무 변경
   * 3가지를 동시에 처리할 수 있어야한다.
   * 현재 제어기 개별값변경은 있으니 제어기 전체값 변경도 할 수 있도록 추가
   * 알람범위와&보정은 확인
   * 센서/제어기 사용유무 변경은 게이트웨이 기준으로 디바이스 useYn를 뽑아오면될듯
   */

  async getSettingValueList(gatewayId: number) {
    /**
     * 1. 전체 제어기 세팅 값 리스트
     * 2. 센서 범위& 보정 값 리스트
     * 3. 센서/제어기 useYn 값 리스트
     */

    // 전체 제어기(정확히는 제어기와 유저커스텀밸류) 리스트
    // 게이트웨이 아이디를 통해서 소속된 유저커스텀밸류 리스트를 반환한다.
    const contDeviceAndUserCustomValueList =
      await this.contDeviceService.getContDeviceAndUserCustomValueListByGatewayId(
        gatewayId,
      );

    // 센서범위&보정 리스트
    const sensorDeviceRangeAndCorrectValueList =
      await this.sensorDeviceService.getSensorDeviceRangeAndCorrectValueListByGatewayId(
        gatewayId,
      );

    // 센서/제어기 useYn 값 리스트
    const sensorAndControllerDeviceUseYnList =
      await this.devicesService.getSensorAndControllerDeviceUseYnListByGatewayId(
        gatewayId,
      );

    const setting: Setting = {
      controllerList: contDeviceAndUserCustomValueList,
      sensorList: sensorDeviceRangeAndCorrectValueList,
      useYnList: sensorAndControllerDeviceUseYnList,
    };

    return setting;
  }

  async updateSetting(gatewayId: number, setting: Setting, user: UsersModel) {
    const currentSetting = await this.getSettingValueList(gatewayId);

    if (
      setting.controllerList.length === 0 ||
      setting.sensorList.length === 0 ||
      setting.useYnList.length === 0 ||
      setting.controllerList.length !== currentSetting.controllerList.length ||
      setting.sensorList.length !== currentSetting.sensorList.length ||
      setting.useYnList.length !== currentSetting.useYnList.length
    ) {
      throw new BadRequestException('잘못된 형식의 세팅값을 보냈습니다.');
    }

    await Promise.all([
      this.contDeviceService.updateContDeviceAndUserCustomValueList(
        setting.controllerList,
        user,
      ),
      this.sensorDeviceService.updateSensorDeviceRangeAndCorrectValueList(
        setting.sensorList,
        user,
      ),
      this.devicesService.updateSensorAndControllerDeviceUseYnList(
        setting.useYnList,
        user,
      ),
    ]);

    return true;
  }
}
