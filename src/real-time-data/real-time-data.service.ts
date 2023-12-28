import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
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
import { UsersModel } from '../users/entity/users.entity';
import { SensorDeviceService } from '../sensors/device/device-sensor.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WarningEnum, sentence } from '../notifications/const/sentence.const';
import { AccumulatedIrradianceModel } from './entities/accumulate/accumulated-irradiance.entity';
import { GatewaysService } from 'src/gateways/gateways.service';
import { JoinLoraDto } from './dto/lora/join-lora.dto';
import wlogger from 'src/log/winston-logger.const';
import { UsersService } from 'src/users/users.service';

type Data = {
  ghid: string;
  glid: string;
  gid: string;
  cid: string;
};

@Injectable()
export class RealTimeDataService {
  constructor(
    @InjectRepository(SensorRealTimeDataModel)
    private readonly realtimeSensorsRepository: Repository<SensorRealTimeDataModel>,
    @InjectRepository(ContRealTimeDataModel)
    private readonly realtimeControllersRepository: Repository<ContRealTimeDataModel>,
    @InjectRepository(AccumulatedIrradianceModel)
    private readonly accumulatedIrradianceRepository: Repository<AccumulatedIrradianceModel>,
    @Inject(forwardRef(() => DevicesService))
    private readonly devicesService: DevicesService,
    private readonly usersService: UsersService,
    private readonly gatewayService: GatewaysService,
    private readonly sensorDeviceService: SensorDeviceService,
    private readonly notiService: NotificationsService,
  ) {}

  // 클라이언트 연결(디바이스 연결)

  async joinDevice(dto: JoinLoraDto) {
    try {
      const gateway = await this.gatewayService.matchingGateway(dto);

      const data = {
        countryId: gateway.countryId,
        areaId: gateway.areaId,
        gatewayId: gateway.gatewayId,
      };

      return `SV+ULD:${data.countryId},${data.areaId},${data.gatewayId},OK`;
    } catch (error) {
      console.error(error);
      wlogger.error('정확한 게이트웨이 정보를 입력해주세요.', error);
      throw new NotFoundException(error);
    }
  }

  // 데이터 받기/분기
  async receiveData(dto: any) {
    /**
     * 뭐 일련의 과정을 거쳐서 <- 여기는 일련의 과정이 없네
     * validateData로 던진다.
     */
    const isSensor = parseInt(dto['cid'].toString()) % 2 === 1;

    const data = await this.branchData(dto, isSensor);

    return `SV+ULD:${data.ghid},${data.glid},${data.gid},OK`;
  }
  //-------------------------------------------------------------------------
  // 검증/변환
  private async branchData(dto: any, isSensor: boolean) {
    /**
     * 검증이나 변환 과정인데 결국에는
     * saveData로 던진다.
     */
    let data: Data;

    if (isSensor) {
      data = await this.saveSensorData(dto);
    } else {
      data = await this.saveControllerData(dto);
    }
    if (!data) {
      throw new NotFoundException('데이터가 없습니다.');
    }

    return data;
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

      const user = await this.usersService.getUserByGatewayId(
        device.gateway.id,
      );

      const sensorDeviceList = device.sensors;

      await this.validateAndNotify(sensorDeviceList, dto, user);

      const data = this.realtimeSensorsRepository.create({ ...dto, device });
      await this.realtimeSensorsRepository.save(data);

      if (dto.s5) {
        await this.saveAccumulateData(dto.s5, device.id);
      }

      const returnData: Data = {
        ghid: dto.ghid,
        glid: dto.glid,
        gid: dto.gid,
        cid: dto.cid,
      };

      return returnData;
    } catch (error) {
      // 에러 처리 로직
      wlogger.error('유효성 에러', error);
      throw new BadRequestException(error);
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

        if (data) {
          const message = await this.validateSensorData(sensorDevice, data);
          if (message) {
            const device = (
              await this.sensorDeviceService.getDeviceSensorById(
                sensorDevice.id,
              )
            ).device;
            const gateway = await this.gatewayService.getGatewayFromDeviceId(
              device.id,
            );
            await this.notiService.registerNotification(
              device.name,
              message,
              user,
              gateway,
            );
          }
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
    const sensorDeviceExtends =
      await this.sensorDeviceService.getDeviceSensorById(sensorDevice.id);
    const sensorSpec = sensorDeviceExtends.spec;
    let message = null;

    if (data <= sensorSpec.lowWarningEnd) {
      message = sentence(sensorDevice.name, WarningEnum.LOW, data);
    } else if (
      data > sensorSpec.highWarningStart &&
      data <= sensorSpec.highWarningEnd
    ) {
      message = sentence(sensorDevice.name, WarningEnum.HIGH, data);
    } else if (data > sensorSpec.dangerStart) {
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

    const [gpio1, gpio2] = dto.gpio.split(',');

    const data = this.realtimeControllersRepository.create({
      ...dto,
      gpio1,
      gpio2,
      device: device,
    });

    await this.realtimeControllersRepository.save(data);

    const returnData: Data = {
      ghid: dto.ghid,
      glid: dto.glid,
      gid: dto.gid,
      cid: dto.cid,
    };

    return returnData;
  }

  // 누적일사량 저장
  async saveAccumulateData(onceIrradiance: number, deviceId: number) {
    const today = new Date().toISOString().split('T')[0];

    let currentIrradiance = await this.accumulatedIrradianceRepository.findOne({
      where: {
        deviceId,
        date: today,
      },
    });

    if (!currentIrradiance) {
      currentIrradiance = this.accumulatedIrradianceRepository.create({
        date: today,
        deviceId,
        dataCount: 0,
        accumulatedIrradiance: 0,
      });
    }

    currentIrradiance.dataCount += 1;
    currentIrradiance.accumulatedIrradiance =
      parseFloat(currentIrradiance.accumulatedIrradiance.toString()) +
      parseFloat(onceIrradiance.toString());

    await this.accumulatedIrradianceRepository.save(currentIrradiance);
  }

  // 누적일사량 가져오기
  async getAccumulateData(deviceId: number) {
    const today = new Date().toISOString().split('T')[0];

    const irradiance = await this.accumulatedIrradianceRepository.findOne({
      where: {
        deviceId,
        date: today,
      },
    });

    if (!irradiance) {
      // wlogger.error('올바른 아이디를 입력해주세요.');
      // throw new BadRequestException('올바른 아이디를 입력해주세요.');

      const tempIrr: AccumulatedIrradianceModel = {
        ...irradiance,
        accumulatedIrradiance: 0,
        dataCount: 0,
        date: '',
        deviceId: deviceId,
        id: 1,
      };
      return tempIrr;
    }

    return irradiance;
  }

  //-------------------------------------------------------------------------

  // 실시간 데이터를 가져와 유저에게 전달하는 로직인데 이름을 뭘로하지

  async fetchRealTimedata(roomId: string) {
    try {
      const [countryId, areaId, gatewayId] = splitString(roomId, 3);
      console.log(countryId, areaId, gatewayId);
      const deviceList = await this.devicesService.findDeviceList(
        countryId,
        areaId,
        gatewayId,
      );
      /**
       * 여기서는 다시 고려해야되는게 실시간 데이터를 보낼때 필요한 정보를 가지고 보내줄 수 있어야 되는데 결국 그렇다는건 처음부터 디바이스 정보를 가져온뒤실시간데이터만 다시 받는걸 처리해야된다.
       * 그렇다는건 처음 클라이언트를 실행할때 디바이스 호출 처리까지 완료를 하는게 맞다.라고 판단된다.
       */

      const fetchDataPromises = deviceList.map((device) => {
        if (device.classify === DeviceEnum.SENSOR) {
          return this.findOneSensorData(device.id).then((data) => ({
            id: device.id,
            sensorData: data,
            type: 'sensor',
          }));
        } else {
          return this.findOneControllerData(device.id).then((data) => ({
            id: device.id,
            controllerData: data,
            type: 'controller',
          }));
        }
      });

      const dataList = await Promise.all(fetchDataPromises);
      console.log(
        dataList.map((data) => data.type),
        new Date(),
      );

      return {
        deviceList: dataList,
        status: true,
      };
    } catch (error) {
      wlogger.error(error);
      throw new BadRequestException(error);
    }
  }

  private async findOneSensorData(deviceId: number) {
    const device = await this.devicesService.getDeviceById(deviceId);
    if (!device) {
      wlogger.error('존재하지 않는 디바이스 아이디입니다.');
      throw new BadRequestException('존재하지 않는 디바이스 아이디입니다.');
    }
    const sensorDataList = await this.realtimeSensorsRepository.findOne({
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

    sensorDataList.device = device;

    return sensorDataList;
  }

  private async findOneControllerData(deviceId: number) {
    const device = await this.devicesService.getDeviceById(deviceId);
    if (!device) {
      wlogger.error('존재하지 않는 디바이스 아이디입니다.');
      throw new BadRequestException('존재하지 않는 디바이스 아이디입니다.');
    }
    const controllerDataList = await this.realtimeControllersRepository.findOne(
      {
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
      },
    );

    controllerDataList.device = device;

    return controllerDataList;
  }
}
