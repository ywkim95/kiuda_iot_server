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
import { GatewaysService } from 'src/gateways/gateways.service';
import { ActionEnum } from 'src/common/const/action-enum.const';
import wlogger from 'src/log/winston-logger.const';
import { QueryRunner as QR } from 'typeorm';
@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DevicesModel)
    private readonly deviceRepository: Repository<DevicesModel>,
    @InjectRepository(DevicesLogModel)
    private readonly deviceLogRepository: Repository<DevicesLogModel>,
    private readonly commonService: CommonService,
    private readonly gatewaysService: GatewaysService,
  ) {}

  // qr

  // deviceRepository qr
  getDeviceRepository(qr?: QR) {
    return qr
      ? qr.manager.getRepository<DevicesModel>(DevicesModel)
      : this.deviceRepository;
  }

  // deviceLogRepository qr
  getDeviceLogRepository(qr?: QR) {
    return qr
      ? qr.manager.getRepository<DevicesLogModel>(DevicesLogModel)
      : this.deviceLogRepository;
  }

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
  async createDevice(dto: CreateDeviceDto, user: UsersModel, qr?: QR) {
    const deviceRepository = this.getDeviceRepository(qr);
    const gateway = await this.gatewaysService.getGatewayById(dto.gateway);

    const device = deviceRepository.create({
      ...dto,
      gateway,
      createdBy: user.email,
    });

    const newDevice = await deviceRepository.save(device);

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
      wlogger.error(`해당 디바이스를 찾을 수 없습니다. id: ${id}`);
      throw new NotFoundException(
        `해당 디바이스를 찾을 수 없습니다. id: ${id}`,
      );
    }
    return device;
  }

  // 수정
  async updateDeviceById(
    id: number,
    dto: UpdateDeviceDto,
    user: UsersModel,
    qr?: QR,
  ) {
    const deviceRepository = this.getDeviceRepository(qr);

    const deviceLogRepository = this.getDeviceLogRepository(qr);

    const gateway = await this.gatewaysService.getGatewayById(dto.gateway);

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
      gateway,
      updatedBy: user.email,
      updatedAt: new Date(),
    };

    console.log(dto.gateway);

    if (dto.gateway) {
      newDevice.pkUpdateDate = new Date();
      /**
       * 업데이트 로그 찍기
       */
    }

    const deviceLog = this.createDeviceLogModel(
      device,
      user.email,
      ActionEnum.PATCH,
      deviceLogRepository,
    );

    await deviceLogRepository.save(deviceLog);

    return await deviceRepository.save(newDevice);
  }

  // 삭제
  async deleteDeviceById(id: number, user: UsersModel, qr?: QR) {
    const deviceRepository = this.getDeviceRepository(qr);

    const deviceLogRepository = this.getDeviceLogRepository(qr);

    const device = await this.getDeviceById(id);

    const deviceLog = this.createDeviceLogModel(
      device,
      user.email,
      ActionEnum.DELETE,
      deviceLogRepository,
    );

    await deviceLogRepository.save(deviceLog);

    return await deviceRepository.delete(id);
  }

  createDeviceLogModel(
    device: DevicesModel,
    userEmail: string,
    actionType: ActionEnum,
    deviceLogRepository: Repository<DevicesLogModel>,
  ) {
    return deviceLogRepository.create({
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
      actionType,
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
        gateway: true,
      },
    });

    if (!device) {
      wlogger.error(
        `해당 디바이스를 찾을 수 없습니다. countryId: ${countryId}, areaId: ${areaId}, gatewayId: ${gatewayId}, clientId: ${clientId}`,
      );
      throw new NotFoundException(
        `해당 디바이스를 찾을 수 없습니다. countryId: ${countryId}, areaId: ${areaId}, gatewayId: ${gatewayId}, clientId: ${clientId}`,
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
      wlogger.error(
        `요청한 게이트웨이에서 디바이스를 찾을 수 없습니다! id: ${gatewayId}`,
      );
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
      wlogger.error('해당 게이트웨이에 디바이스 정보가 없습니다.');
      throw new NotFoundException(
        '해당 게이트웨이에 디바이스 정보가 없습니다.',
      );
    }

    return sensorAndControllerDeviceUseYnList;
  }

  async updateSensorAndControllerDeviceUseYnList(
    list: DevicesModel[],
    user: UsersModel,
    qr?: QR,
  ) {
    const newList = list.map(async (model) => {
      const device = await this.deviceRepository.findOne({
        where: {
          id: model.id,
        },
        relations: {
          gateway: true,
        },
      });

      if (!device) {
        wlogger.error('디바이스의 아이디를 다시 확인해주세요.');
        throw new NotFoundException('디바이스의 아이디를 다시 확인해주세요.');
      }

      const updateDevice: UpdateDeviceDto = {
        ...model,
        gateway: device.gateway.id,
      };

      return await this.updateDeviceById(model.id, updateDevice, user, qr);
    });

    return await Promise.all(newList);
  }
}
