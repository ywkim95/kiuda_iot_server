import { Injectable, NotFoundException } from '@nestjs/common';
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
import { ContDeviceService } from '../controllers/device/device-controller.service';
import { FiveMinutesAverageModel } from './entities/average/five-minutes-average.entity';
import { ContMapService } from '../controllers/mappings/mappings-controller.service';
import { UpdateContDeviceDto } from 'src/controllers/device/dto/update-devices-controller.dto';
import { isEqual } from 'lodash';

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
    private readonly contDeviceService: ContDeviceService,
    private readonly contMapService: ContMapService,
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

  // 저장
  private async saveSensorData(dto: CreateRealTimeSensorsDto) {
    const device = await this.sensorDeviceService.getSensorDeviceFromRealTime(
      dto.ghid,
      dto.glid,
      dto.gid,
      dto.cid,
    );

    const data = this.realtimeSensorsRepository.create({
      ...dto,
      device,
    });

    const newData = await this.realtimeSensorsRepository.save(data);

    return newData;
  }

  private async saveControllerData(dto: CreateRealTimeControllersDto) {
    const device = await this.contDeviceService.getContDeviceFromRealTime(
      dto.ghid,
      dto.glid,
      dto.gid,
      dto.cid,
    );

    const data = this.realtimeControllersRepository.create({
      ...dto,
      device,
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

  async getSensorListByControllerId(controllerId: number) {
    /**
     * 1. 컨트롤러아이디를 통해서 센서아이디를 받아온다.
     * 2. 센서아이디를 통해서 디바이스 아이디를 받아온다.
     * 3. 디바이스아이디를 통해서 센서리스트를 받아오고 반환한다.
     */
    const sensorId = (
      await this.contDeviceService.getDeviceControllerById(controllerId)
    ).sensor.id;

    const deviceId = (
      await this.sensorDeviceService.getDeviceSensorById(sensorId)
    ).device.id;

    return await this.sensorDeviceService.getSensorListFromDeviceId(deviceId);
  }

  async setSensorFromController(
    controllerId: number,
    dto: UpdateContDeviceDto,
    user: UsersModel,
  ) {
    /**
     * 컨트롤러아이디와 dto를 받아서 내용을 업데이트 해준다.
     * 해당하는 값을 업데이트 하되 manualValue가 들어오면 매핑리스트 엔티티도 업데이트를 해줘야한다.
     * 센서가 들어오면 디바이스에서 센서를 변경한다.
     *
     */
    const currentCont =
      await this.contDeviceService.getDeviceControllerById(controllerId);

    const comparisonData = {
      ...currentCont,
      ...dto,
    };
    if (isEqual(currentCont, comparisonData)) {
      return currentCont;
    }

    if (dto.manualValue) {
      const mappingList =
        await this.contMapService.getMappingListByContId(controllerId);
      mappingList[0].sensorRangeEnd = dto.manualValue;
      mappingList[mappingList.length - 1].sensorRangeStart =
        dto.manualValue + 0.1;
      await this.contMapService.saveMappingList(mappingList);
    }

    const newCont = {
      ...comparisonData,
      updatedBy: user.email,
      updatedAt: new Date(),
    };

    return await this.realtimeControllersRepository.save(newCont);
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
  ) {
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
  ) {
    const updatedSensor: SensorDeviceModel = {
      ...currentSensor,
      ...newSensorData,
      updatedBy,
      updatedAt: new Date(),
    };
    await this.sensorDeviceService.saveSensorDevice(updatedSensor);
  }
}
