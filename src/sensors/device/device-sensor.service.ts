import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class SensorDeviceService {
  constructor(
    @InjectRepository(SensorDeviceModel)
    private readonly deviceSensorRepository: Repository<SensorDeviceModel>,
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

  // 상세정보
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

    return await this.deviceSensorRepository.save(newDeviceSensor);
  }

  // 삭제
  async deleteDeviceSensorById(id: number) {
    await this.getDeviceSensorById(id);

    return await this.deviceSensorRepository.delete(id);
  }

  // 국가, 지역, 게이트웨이, 클라이언트 아이디 4개의 값을 받아서 검색하는 로직
  async getSensorDeviceFromRealTime(
    countryId: string,
    areaId: string,
    gatewayId: string,
    clientId: string,
  ) {
    const device = await this.deviceSensorRepository.findOne({
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
    if (!device) {
      throw new NotFoundException();
    }
    return device;
  }

  // id리스트를 받아서 관련된 컬럼을 검색하는 로직
  async getSensorDeviceListFromRealTime(idList: number[]) {
    const sensorList = await this.deviceSensorRepository.find({
      where: {
        id: In(idList),
      },
    });

    if (sensorList.length === 0) {
      throw new NotFoundException();
    }

    return sensorList;
  }

  // 받은 데이터를 저장하는 로직
  async saveSensorDevice(updatedData: SensorDeviceModel): Promise<void> {
    await this.deviceSensorRepository.save(updatedData);
  }

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

  // deviceid와 controllerid를 받아서 관련된 센서리스트를 가져오는 로직
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
}
