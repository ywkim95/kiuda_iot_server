import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateRealTimeSensorsDto } from './dto/create-real-time-sensor.dto';
// import { RealTimeGateway } from './real-time.gateway';
import { RealTimeSensorsModel } from './entities/real-time/real-time-sensor.entity';
import { RealTimeControllersModel } from './entities/real-time/real-time-controller.entity';
import { CreateRealTimeControllersDto } from './dto/create-real-time-contrller.dto';
import { DeviceSensorsModel } from '../device/entities/device-sensor.entity';
import { DeviceControllersModel } from 'src/devices/controllers/entities/device-controller.entity';
import { splitString } from './const/splitString.const';
import { DeviceEnum } from 'src/devices/const/deviceEnum.const';
import { DevicesService } from 'src/devices/devices.service';
import { UpdateAlarmRangeAndCalibrateDto } from './dto/update-alarm-range-and-calibrate.dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { isEqual } from 'lodash';
import { DevicesModel } from 'src/devices/entities/device.entity';
import { TimeUnitEnum } from './const/time-unit.enum';

@Injectable()
export class RealTimeService {
  constructor(
    @InjectRepository(RealTimeSensorsModel)
    private readonly realtimeSensorsRepository: Repository<RealTimeSensorsModel>,
    @InjectRepository(RealTimeControllersModel)
    private readonly realtimeControllersRepository: Repository<RealTimeControllersModel>,
    @InjectRepository(DeviceSensorsModel)
    private readonly deviceSensorsRepository: Repository<DeviceSensorsModel>,
    @InjectRepository(DeviceControllersModel)
    private readonly deviceControllersRepository: Repository<DeviceControllersModel>,
    private readonly devicesService: DevicesService,
    // private readonly realtimeGateway: RealTimeGateway,
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
    let data: RealTimeSensorsModel | RealTimeControllersModel;
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

  // 저장
  private async saveSensorData(dto: CreateRealTimeSensorsDto) {
    const device = await this.deviceSensorsRepository.findOne({
      where: {
        device: {
          gateway: {
            countryId: dto.ghid,
            areaId: dto.glid,
            gatewayId: dto.gid,
          },
          clientId: dto.cid,
        },
      },
    });

    if (!device) {
      throw new NotFoundException();
    }

    const data = this.realtimeSensorsRepository.create({
      ...dto,
      device,
    });

    const newData = await this.realtimeSensorsRepository.save(data);

    return newData;
  }

  private async saveControllerData(dto: CreateRealTimeControllersDto) {
    const device = await this.deviceControllersRepository.findOne({
      where: {
        device: {
          gateway: {
            countryId: dto.ghid,
            areaId: dto.glid,
            gatewayId: dto.gid,
          },
          clientId: dto.cid,
        },
      },
    });
    if (!device) {
      throw new NotFoundException();
    }
    const data = this.realtimeControllersRepository.create({
      ...dto,
      device,
    });

    const newData = await this.realtimeControllersRepository.save(data);

    return newData;
  }

  // 실시간 데이터를 가져와 유저에게 전달하는 로직인데 이름을 뭘로하지
  //
  async fetchRealTimedata(roomId: string) {
    const [countryId, areaId, gatewayId] = splitString(roomId, 3);
    const deviceList = await this.devicesService.findDeviceList(
      countryId,
      areaId,
      gatewayId,
    );
    let dataList = [];
    for await (const device of deviceList) {
      if (device.classify === DeviceEnum.SENSOR) {
        const data = await this.findOneSensorData(device.id);
        dataList.push(data);
      } else {
        const data = await this.findOneControllerData(device.id);
        dataList.push(data);
      }
    }

    return dataList;
    // await this.sendData(dataList, roomId);
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

  async getTableAndGraph(deviceId: number, unit: TimeUnitEnum) {
    /**
     * 이건 누적 테이블을 만들어서 데이터를 보내줘야겠다.
     *
     * 계산 방식은 일(day) 기준으로 한다.
     */

    switch (unit) {
      case TimeUnitEnum.MINUTE:
        return;
      case TimeUnitEnum.DAILY:
        return;
      case TimeUnitEnum.MONTHLY:
        return;
    }
  }

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
    const sensors = await this.deviceSensorsRepository.find({
      where: {
        id: In(sensorIds),
      },
    });

    return new Map(sensors.map((sensor) => [sensor.id, sensor]));
  }

  isSensorUpdated(
    sensorsMap: Map<number, DeviceSensorsModel>,
    sensorDto: DeviceSensorsModel,
  ) {
    const currentSensor: DeviceSensorsModel = sensorsMap[sensorDto.id];
    const isCorrectionValueUpdated =
      currentSensor.correctionValue !== sensorDto.correctionValue;
    const isCustomStableStart =
      currentSensor.customStableStart !== sensorDto.customStableStart;
    const isCustomStableEnd =
      currentSensor.customStableEnd !== sensorDto.customStableEnd;

    return isCorrectionValueUpdated || isCustomStableStart || isCustomStableEnd;
  }

  async updateSensor(
    currentSensor: DeviceSensorsModel,
    newSensorData: DeviceSensorsModel,
    updatedBy: string,
  ) {
    const updatedSensor = {
      ...currentSensor,
      ...newSensorData,
      updatedBy,
      updatedAt: new Date(),
    };
    await this.deviceSensorsRepository.save(updatedSensor);
  }
}
