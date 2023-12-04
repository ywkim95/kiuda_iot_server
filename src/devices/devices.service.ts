import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DevicesModel } from './entities/device.entity';
import { Repository } from 'typeorm';
import { DevicePaginationDto } from './dto/paginate-device.dto';
import { CommonService } from '../common/common.service';
import { UsersModel } from '../users/entity/users.entity';
import { isEqual } from 'lodash';
import { DeviceEnum } from './const/deviceEnum.const';
import { DevicesLogModel } from './entities/device-log.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DevicesModel)
    private readonly deviceRepository: Repository<DevicesModel>,
    @InjectRepository(DevicesLogModel)
    private readonly deviceLogRepository: Repository<DevicesLogModel>,
    private readonly commonService: CommonService,
  ) {}

  // 기본 CRUD + 페이지네이션

  // pagination
  async paginateDevices(dto: DevicePaginationDto) {
    return await this.commonService.paginate(
      dto,
      this.deviceRepository,
      {
        relations: {
          gateway: true,
          sensors: true,
          controllers: true,
        },
      },
      'devices',
    );
  }

  // 등록
  async createDevice(dto: CreateDeviceDto, user: UsersModel) {
    const device = this.deviceRepository.create({
      ...dto,
      createdBy: user.email,
      updatedBy: user.email,
    });
    const newDevice = await this.deviceRepository.save(device);

    return newDevice;
  }

  // 조회
  async getDeviceById(id: number) {
    const device = await this.deviceRepository.findOne({
      where: {
        id,
      },
      relations: {
        gateway: true,
        sensors: true,
        controllers: true,
      },
    });
    if (!device) {
      throw new NotFoundException();
    }
    return device;
  }

  // 수정
  async updateDeviceById(id: number, dto: UpdateDeviceDto, user: UsersModel) {
    const device = await this.getDeviceById(id);

    const comparisonData = {
      ...device,
      ...dto,
    };

    if (isEqual(device, comparisonData)) {
      return device;
    }

    const newDevice = {
      ...comparisonData,
      updatedBy: user.email,
      updatedAt: new Date(),
    };

    if (dto.gateway) {
      newDevice.pkUpdateDate = new Date();
      /**
       * 업데이트 로그 찍기
       */
    }

    const deviceLog = this.createDeviceLogModel(device, user.email);

    await this.deviceLogRepository.save(deviceLog);

    return await this.deviceRepository.save(newDevice);
  }

  // 삭제
  async deleteDeviceById(id: number, user: UsersModel) {
    const device = await this.deviceRepository.findOne({
      where: {
        id,
      },
    });

    if (!device) {
      throw new NotFoundException();
    }

    const deviceLog = this.createDeviceLogModel(device, user.email);

    await this.deviceLogRepository.save(deviceLog);

    return await this.deviceRepository.delete(id);
  }

  createDeviceLogModel(device: DevicesModel, userEmail: string) {
    return this.deviceLogRepository.create({
      classify: device.classify,
      clientId: device.clientId,
      description: device.description,
      gateway: device.gateway,
      location: device.location,
      modelId: device.id,
      name: device.name,
      pkUpdateDate: device.pkUpdateDate,
      recordedBy: userEmail,
      resetYn: device.resetYn,
      statusCode: device.statusCode,
      useYn: device.useYn,
    });
  }

  // ------------------------------------------------------------------
  // 여기서부터 커스텀

  // 아이디들을 가지고 디바이스 찾기
  async findDeviceList(countryId: string, areaId: string, gatewayId: string) {
    return await this.deviceRepository.find({
      where: {
        gateway: {
          countryId,
          areaId,
          gatewayId,
        },
      },
    });
  }

  // 아이디들을 받아 하나의 디바이스 반환하는 로직
  async getOnceDeviceByIdList(
    countryId: string,
    areaId: string,
    gatewayId: string,
    clientId: string,
  ) {
    const device = await this.deviceRepository.findOne({
      where: {
        gateway: {
          countryId,
          areaId,
          gatewayId,
        },
        clientId,
      },
      relations: {
        sensors: true,
        controllers: true,
      },
    });

    if (!device) {
      throw new NotFoundException(
        '해당하는 아이디를 가진 디바이스가 없습니다.',
      );
    }

    return device;
  }

  // 게이트웨이 아이디로 구분이 센서인 디바이스리스트 가져오기
  async findDeviceListforSensors(gatewayId: number) {
    const deviceList = await this.deviceRepository.find({
      where: {
        gateway: {
          id: gatewayId,
        },
        classify: DeviceEnum.SENSOR,
      },
      relations: {
        sensors: true,
      },
    });
    if (deviceList.length === 0) {
      throw new NotFoundException(
        `요청한 게이트웨이에서 디바이스를 찾을 수 없습니다! id: ${gatewayId}`,
      );
    }
    return deviceList;
  }
  // ------------------------------------------------------------------

  // 구분이 센서인 디바이스 아이디 전체리스트 가져오기
  async getAllDeviceSensorIds() {
    const ids = await this.deviceRepository
      .createQueryBuilder('device')
      .select('device.id')
      .where('device.classify = :classify', { classify: DeviceEnum.SENSOR })
      .getMany();

    return ids.map((device) => device.id);
  }

  // 센서 및 제어기 디바이스 useYn 리스트
  async getSensorAndControllerDeviceUseYnListByGatewayId(gatewayId: number) {
    const sensorAndControllerDeviceUseYnList = await this.deviceRepository.find(
      {
        where: {
          gateway: {
            id: gatewayId,
          },
        },
      },
    );

    if (
      !sensorAndControllerDeviceUseYnList ||
      sensorAndControllerDeviceUseYnList.length === 0
    ) {
      throw new NotFoundException(
        '해당 게이트웨이에 디바이스 정보가 없습니다.',
      );
    }

    return sensorAndControllerDeviceUseYnList;
  }

  async updateSensorAndControllerDeviceUseYnList(
    list: DevicesModel[],
    user: UsersModel,
  ) {
    await Promise.all(
      list.map((model) => {
        const updateDevice: UpdateDeviceDto = { ...model };
        return this.updateDeviceById(model.id, updateDevice, user);
      }),
    );
  }
}
