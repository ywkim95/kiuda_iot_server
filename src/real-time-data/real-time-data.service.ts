import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import { CreateRealTimeSensorsDto } from './dto/create-real-time-sensor.dto';
import { SensorRealTimeDataModel } from './entities/real-time/real-time-sensor.entity';
import { ContRealTimeDataModel } from './entities/real-time/real-time-controller.entity';
import { CreateRealTimeControllersDto } from './dto/create-real-time-contrller.dto';
import { SensorDeviceModel } from '../sensors/device/entities/device-sensor.entity';
import { splitString } from './const/splitString.const';
import { DeviceEnum } from 'src/devices/const/deviceEnum.const';
import { DevicesService } from 'src/devices/devices.service';
import { UpdateAlarmRangeAndCalibrateDto } from './dto/update-alarm-range-and-calibrate.dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { TimeUnitEnum } from './const/time-unit.enum';
import { SensorDeviceService } from '../sensors/device/device-sensor.service';
import { ContDeviceService } from 'src/controllers/device/device-controller.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FiveMinutesAverageModel } from './entities/average/five-minutes-average.entity';

@Injectable()
export class RealTimeDataService {
  constructor(
    @InjectRepository(SensorRealTimeDataModel)
    private readonly realtimeSensorsRepository: Repository<SensorRealTimeDataModel>,
    @InjectRepository(ContRealTimeDataModel)
    private readonly realtimeControllersRepository: Repository<ContRealTimeDataModel>,
    private readonly devicesService: DevicesService,
    private readonly sensorDeviceService: SensorDeviceService,
    private readonly contDeviceService: ContDeviceService,
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

  // 테이블과 그래프

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

  // 5분마다 누적데이터 저장로직
  @Cron(CronExpression.EVERY_5_MINUTES)
  async saveDataFiveMinutes() {
    /**
     * 1. 모든 iot센서들의 id를 가져와 id리스트를 만든다. 
     * 2. id리스트를 기준으로 id별로 각각의 항목(s1~s20)의 5분동안의 데이터를 합치고 평균을 낸다.
     * 3. 모든 id리스트의 합치기 계산이 끝나면 5분간의 데이터의 수를 더해서 평균값과 함께 모델에 넣는다.
     * 4. 물론 5분간의 데이터 중 가장 첫번째 데이터의 저장일자와 마지막 저장일자를 측정 시작 시간, 측정 종료 시간에 넣는다.
     * 5. 각각의 평균데이터리스트들은 자신에 해당하는 device의 정보를 알기위해서 device의 id를 가지고있는다. 
     */

    const sensorIds = await this.devicesService.getAllDeviceSensorIds();

    const averageModels = await Promise.all(
      sensorIds.map(id => this.)
    )
  }

  private async processSensorData(sensorId: number): Promise<FiveMinutesAverageModel> {
    const allSensorData = await this.getSensorData(sensorId);
    const fiveMinutesAverageModel = new  FiveMinutesAverageModel();
    fiveMinutesAverageModel.device = allSensorData[0]?.device;

    for(let i = 1 ; i <= 20 ; i ++ ){
      // 평균값 계산
    let sum = 0;
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    let count = 0;

    for( const data of allSensorData){
      const sensorValue = data[`s${i}`];
      if(sensorValue !== undefined) {
        sum += sensorValue;
        min = Math.min(min, sensorValue);
      }
      
    }
    
    }
    

    return ;
  }

  private async getSensorData(sensorId: number): Promise<SensorRealTimeDataModel[]> {
    const fiveMinuteAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.realtimeSensorsRepository.find({
      where:{
        device: {
          id: sensorId,
        },
        createdAt: MoreThan(fiveMinuteAgo),
      },
      relations: {
        device: true
      }
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
