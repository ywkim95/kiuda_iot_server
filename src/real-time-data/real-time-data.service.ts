import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRealTimeSensorsDto } from './dto/create-real-time-sensor.dto';
import { SensorRealTimeDataModel } from './entities/real-time/real-time-sensor.entity';
import { ContRealTimeDataModel } from './entities/real-time/real-time-controller.entity';
import { CreateRealTimeControllersDto } from './dto/create-real-time-contrller.dto';
import { SensorDeviceModel } from '../sensors/device/entities/device-sensor.entity';
import { splitString } from './const/splitString.const';
import { DeviceEnum } from '../devices/const/deviceEnum.const';
import { DevicesService } from '../devices/devices.service';
import { UpdateAlarmRangeAndCalibrateDto } from './dto/update-alarm-range-and-calibrate.dto';
import { UsersModel } from '../users/entity/users.entity';
import { SensorDeviceService } from '../sensors/device/device-sensor.service';
import { FiveMinutesAverageModel } from './entities/average/five-minutes-average.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { WarningEnum, sentence } from 'src/notifications/const/sentence.const';

@Injectable()
export class RealTimeDataService {
  constructor(
    @InjectRepository(SensorRealTimeDataModel)
    private readonly realtimeSensorsRepository: Repository<SensorRealTimeDataModel>,
    @InjectRepository(ContRealTimeDataModel)
    private readonly realtimeControllersRepository: Repository<ContRealTimeDataModel>,
    @InjectRepository(FiveMinutesAverageModel)
    private readonly devicesService: DevicesService,
    private readonly sensorDeviceService: SensorDeviceService,
    private readonly notiService: NotificationsService,
  ) {}

  // 데이터 받기/분기
  async receiveData(dto: any) {
    /**
     * 뭐 일련의 과정을 거쳐서 <- 여기는 일련의 과정이 없네
     * validateData로 던진다.
     */
    const isSensor = parseInt(dto['cid'].toString()) % 2 === 0;

    await this.branchData(dto, isSensor);
  }
  //-------------------------------------------------------------------------
  // 검증/변환
  private async branchData(dto: any, isSensor: boolean) {
    /**
     * 검증이나 변환 과정인데 결국에는
     * saveData로 던진다.
     */
    let data: SensorRealTimeDataModel | ContRealTimeDataModel;

    if (isSensor) {
      data = await this.saveSensorData(dto);
    } else {
      data = await this.saveControllerData(dto);
    }
    if (!data) {
      throw new NotFoundException();
    }

    return true;
  }

  // 센서 데이터 저장 및 유효성 검사
  private async saveSensorData(dto: CreateRealTimeSensorsDto) {
    try {
      const device = await this.devicesService.getOnceDeviceByIdList(
        dto.ghid,
        dto.glid,
        dto.gid,
        dto.cid,
      );
      const user = device.gateway.owner;
      const sensorDeviceList = device.sensors;

      await this.validateAndNotify(sensorDeviceList, dto, user);

      const data = this.realtimeSensorsRepository.create({ ...dto, device });
      const newData = await this.realtimeSensorsRepository.save(data);

      return newData;
    } catch (error) {
      // 에러 처리 로직
      throw new ConflictException();
    }
  }

  // 각 센서 장치에 대한 유효성 검사 및 알림 전송
  private async validateAndNotify(
    sensorDeviceList: SensorDeviceModel[],
    dto: CreateRealTimeSensorsDto,
    user: UsersModel,
  ) {
    const notificationPromises = sensorDeviceList.map(
      async (sensorDevice, index) => {
        const data = dto[`s${index + 1}`];
        const message = await this.validateSensorData(sensorDevice, data);

        if (message) {
          await this.notiService.registerNotification(
            sensorDevice.device.name,
            message,
            user,
            sensorDevice.device,
          );
        }
      },
    );

    await Promise.all(notificationPromises);
  }

  // 센서 데이터의 유효성을 검사하는 함수
  private async validateSensorData(
    sensorDevice: SensorDeviceModel,
    data: number,
  ): Promise<string | null> {
    const checkData = sensorDevice.spec;
    let message = null;

    if (data > checkData.lowWarningStart && data <= checkData.lowWarningEnd) {
      message = sentence(sensorDevice.name, WarningEnum.LOW, data);
    } else if (
      data > checkData.highWarningStart &&
      data <= checkData.highWarningEnd
    ) {
      message = sentence(sensorDevice.name, WarningEnum.HIGH, data);
    } else if (data > checkData.dangerStart && data <= checkData.dangerEnd) {
      message = sentence(sensorDevice.name, WarningEnum.DANGER, data);
    }

    return message;
  }

  private async saveControllerData(dto: CreateRealTimeControllersDto) {
    const device = await this.devicesService.getOnceDeviceByIdList(
      dto.ghid,
      dto.glid,
      dto.gid,
      dto.cid,
    );

    const data = this.realtimeControllersRepository.create({
      ...dto,
      device: device,
    });

    const newData = await this.realtimeControllersRepository.save(data);

    return newData;
  }

  //-------------------------------------------------------------------------

  // 실시간 데이터를 가져와 유저에게 전달하는 로직인데 이름을 뭘로하지

  async fetchRealTimedata(roomId: string) {
    const [countryId, areaId, gatewayId] = splitString(roomId, 3);
    const deviceList = await this.devicesService.findDeviceList(
      countryId,
      areaId,
      gatewayId,
    );

    const fetchDataPromises = deviceList.map((device) => {
      if (device.classify === DeviceEnum.SENSOR) {
        return this.findOneSensorData(device.id);
      } else {
        return this.findOneControllerData(device.id);
      }
    });

    const dataList = await Promise.all(fetchDataPromises);

    return dataList;
  }

  private async findOneSensorData(deviceId: number) {
    return await this.realtimeSensorsRepository.findOne({
      where: {
        device: {
          id: deviceId,
        },
      },
      order: {
        id: 'DESC',
      },
      relations: {
        device: true,
      },
    });
  }

  private async findOneControllerData(deviceId: number) {
    return await this.realtimeControllersRepository.findOne({
      where: {
        device: {
          id: deviceId,
        },
      },
      order: {
        id: 'DESC',
      },
      relations: {
        device: true,
      },
    });
  }

  //-------------------------------------------------------------------------

  async getAlarmRangeAndCalibrateById(gatewayId: number) {
    const deviceList =
      await this.devicesService.findDeviceListforSensors(gatewayId);

    return deviceList;
  }

  async updateAlarmRangeAndCalibrate(
    dtoList: UpdateAlarmRangeAndCalibrateDto[],
    user: UsersModel,
  ) {
    // currentSensorIdList
    // number[]
    const sensorIds = dtoList.flatMap((dto) =>
      dto.sensors.map((sensor) => sensor.id),
    );
    // Map<id, model>
    const sensorsMap = await this.fetchSensorsMap(sensorIds);

    // void[]
    const updatePromises = dtoList.flatMap((dto) =>
      dto.sensors
        .filter((sensor) => this.isSensorUpdated(sensorsMap, sensor))
        .map((sensor) =>
          this.updateSensor(sensorsMap[sensor.id], sensor, user.email),
        ),
    );

    await Promise.all(updatePromises);

    return true;
  }

  async fetchSensorsMap(sensorIds: number[]) {
    const sensors =
      await this.sensorDeviceService.getSensorDeviceListFromRealTime(sensorIds);

    return new Map(sensors.map((sensor) => [sensor.id, sensor]));
  }

  isSensorUpdated(
    sensorsMap: Map<number, SensorDeviceModel>,
    sensorDto: SensorDeviceModel,
  ): boolean {
    const currentSensor: SensorDeviceModel = sensorsMap[sensorDto.id];
    const isCorrectionValueUpdated =
      currentSensor.correctionValue !== sensorDto.correctionValue;
    const isCustomStableStart =
      currentSensor.customStableStart !== sensorDto.customStableStart;
    const isCustomStableEnd =
      currentSensor.customStableEnd !== sensorDto.customStableEnd;

    return isCorrectionValueUpdated || isCustomStableStart || isCustomStableEnd;
  }

  async updateSensor(
    currentSensor: SensorDeviceModel,
    newSensorData: SensorDeviceModel,
    updatedBy: string,
  ): Promise<void> {
    const updatedSensor: SensorDeviceModel = {
      ...currentSensor,
      ...newSensorData,
      updatedBy,
      updatedAt: new Date(),
    };
    await this.sensorDeviceService.saveSensorDevice(updatedSensor);
  }
}
