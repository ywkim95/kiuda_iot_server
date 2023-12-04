import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateSensorDeviceDto } from './dto/update-device-sensor.dto';
import { UsersModel } from '../../users/entity/users.entity';
import { CreateSensorDeviceDto } from './dto/create-device-sensor.dto';
import { SensorDevicePaginateDto } from './dto/paginate-device-sensor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SensorDeviceModel } from './entities/device-sensor.entity';
import { DevicesService } from '../../devices/devices.service';
import { SensorSpecService } from '../specifications/specifications-sensor.service';
import { CommonService } from '../../common/common.service';
import { isEqual } from 'lodash';
import { SensorDeviceLogModel } from './entities/device-sensor-log.entity';

@Injectable()
export class SensorDeviceService {
  constructor(
    @InjectRepository(SensorDeviceModel)
    private readonly deviceSensorRepository: Repository<SensorDeviceModel>,
    @InjectRepository(SensorDeviceLogModel)
    private readonly deviceSensorLogRepository: Repository<SensorDeviceLogModel>,
    private readonly deviceService: DevicesService,
    private readonly specService: SensorSpecService,
    private readonly commonService: CommonService,
  ) {}

  // 실기기

  // 페이지네이션
  async paginateDeviceSensors(dto: SensorDevicePaginateDto) {
    return await this.commonService.paginate(
      dto,
      this.deviceSensorRepository,
      {
        relations: {
          device: true,
          spec: true,
        },
      },
      'sensors/deviceSensors',
    );
  }

  // 조회
  async getDeviceSensorById(id: number) {
    const deviceSensor = await this.deviceSensorRepository.findOne({
      where: {
        id,
      },
      relations: {
        device: true,
        spec: true,
      },
    });

    if (deviceSensor) {
      throw new NotFoundException(
        `해당 장비를 찾을 수 없습니다. 요청한 id가 ${id}가 맞는지 확인 바랍니다.`,
      );
    }

    return deviceSensor;
  }

  // 등록
  async createDeviceSensor(dto: CreateSensorDeviceDto, user: UsersModel) {
    const sensorDevice = this.deviceSensorRepository.create({
      ...dto,
      createdBy: user.email,
      updatedBy: user.email,
    });

    const newSensorDevice = this.deviceSensorRepository.save(sensorDevice);

    return newSensorDevice;
  }

  // 수정
  async updateDeviceSensorById(
    id: number,
    dto: UpdateSensorDeviceDto,
    user: UsersModel,
  ) {
    const deviceSensor = await this.getDeviceSensorById(id);

    const comparisonData = {
      ...deviceSensor,
      ...dto,
    };

    if (isEqual(deviceSensor, comparisonData)) {
      return deviceSensor;
    }

    const newDeviceSensor = {
      ...comparisonData,
      updatedBy: user.email,
      updatedAt: new Date(),
    };

    const deviceSensorLog = this.createDeviceSensorLogModel(
      deviceSensor,
      user.email,
    );

    await this.deviceSensorLogRepository.save(deviceSensorLog);

    return await this.deviceSensorRepository.save(newDeviceSensor);
  }

  // 삭제
  async deleteDeviceSensorById(id: number, user: UsersModel) {
    const deviceSensor = await this.getDeviceSensorById(id);

    const deviceSensorLog = this.createDeviceSensorLogModel(
      deviceSensor,
      user.email,
    );

    await this.deviceSensorLogRepository.save(deviceSensorLog);

    return await this.deviceSensorRepository.delete(id);
  }

  // ------------------------------------------------------------------

  // 로그 모델 생성 로직
  createDeviceSensorLogModel(
    deviceSensor: SensorDeviceModel,
    userEmail: string,
  ) {
    return this.deviceSensorLogRepository.create({
      correctionValue: deviceSensor.correctionValue,
      customStableEnd: deviceSensor.customStableEnd,
      customStableStart: deviceSensor.customStableStart,
      device: deviceSensor.device,
      modelId: deviceSensor.id,
      name: deviceSensor.name,
      recordedBy: userEmail,
      spec: deviceSensor.spec,
    });
  }

  // 국가, 지역, 게이트웨이, 클라이언트 아이디 4개의 값을 받아서 검색하는 로직
  async getSensorDeviceFromRealTime(
    countryId: string,
    areaId: string,
    gatewayId: string,
    clientId: string,
  ) {
    const deviceList = await this.deviceSensorRepository.find({
      where: {
        device: {
          gateway: {
            countryId,
            areaId,
            gatewayId,
          },
          clientId,
        },
      },
    });

    if (!deviceList || deviceList.length === 0) {
      throw new NotFoundException();
    }

    return deviceList;
  }

  // id리스트를 받아서 관련된 컬럼을 검색하는 로직
  async getSensorDeviceListFromRealTime(idList: number[]) {
    const sensorList = await this.deviceSensorRepository.find({
      where: {
        id: In(idList),
      },
    });

    if (sensorList.length === 0) {
      throw new NotFoundException(
        '해당하는 센서 디바이스 목록이 존재하지 않습니다.',
      );
    }

    return sensorList;
  }

  // deviceid를 받아서 관련된 센서리스트를 가져오는 로직
  async getSensorListFromDeviceId(
    deviceId: number,
  ): Promise<SensorDeviceModel[]> {
    const list = await this.deviceSensorRepository.find({
      where: {
        device: {
          id: deviceId,
        },
      },
    });

    if (list.length === 0) {
      throw new NotFoundException();
    }

    return list;
  }

  // 받은 센서디바이스 저장 로직
  async saveSensorDevice(updatedData: SensorDeviceModel): Promise<void> {
    await this.deviceSensorRepository.save(updatedData);
  }

  // 받은 센서디바이스 리스트 저장 로직
  async saveSensorDeviceList(list: SensorDeviceModel[]) {
    const sensorReturn = await Promise.all(
      list.map((device) => this.deviceSensorRepository.save(device)),
    );
    if (sensorReturn.length === 0) {
      throw new BadRequestException(
        '센서 디바이스 리스트를 저장하는데 실패했습니다. 다시 한 번 리스트를 확인해주세요',
      );
    }

    return true;
  }

  // 센서범위&보정 값 리스트
  async getSensorDeviceRangeAndCorrectValueListByGatewayId(gatewayId: number) {
    const sensorDeviceRangeAndCorrectValueList =
      await this.deviceSensorRepository.find({
        where: {
          device: {
            gateway: {
              id: gatewayId,
            },
          },
        },
      });
    if (
      !sensorDeviceRangeAndCorrectValueList ||
      sensorDeviceRangeAndCorrectValueList.length === 0
    ) {
      throw new NotFoundException(
        '해당 게이트웨이에 디바이스 정보가 없습니다.',
      );
    }
    return sensorDeviceRangeAndCorrectValueList;
  }

  // 센서범위&보정 값 리스트 업데이트
  async updateSensorDeviceRangeAndCorrectValueList(
    list: SensorDeviceModel[],
    user: UsersModel,
  ) {
    await Promise.all(
      list.map((model) => {
        const updateSensorDevice: UpdateSensorDeviceDto = { ...model };
        return this.updateDeviceSensorById(model.id, updateSensorDevice, user);
      }),
    );
  }

  // 자동생성기
  async generateDeviceSensors(user: UsersModel) {
    for (let i = 0; i < 12; i++) {
      let dto = new CreateSensorDeviceDto();
      dto.correctionValue = (i + 1) * 10;
      dto.name = `hello{i}`;
      dto.customStableStart = 0;
      dto.customStableEnd = 6000;
      dto.device = await this.deviceService.getDeviceById(5);
      dto.spec = await this.specService.getSensorSpecificationById(5);
      await this.createDeviceSensor(dto, user);
    }
  }
}
