import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DevicesModel)
    private readonly deviceRepository: Repository<DevicesModel>,
    private readonly commonService: CommonService,
  ) {}

  // 기본 CRUD + 페이지네이션
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

  async createDevice(dto: CreateDeviceDto, user: UsersModel) {
    const device = this.deviceRepository.create({
      ...dto,
      createdBy: user.email,
      updatedBy: user.email,
    });
    const newDevice = await this.deviceRepository.save(device);

    return newDevice;
  }

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

    return await this.deviceRepository.save(newDevice);
  }

  async deleteDeviceById(id: number) {
    const device = await this.deviceRepository.findOne({
      where: {
        id,
      },
    });
    if (!device) {
      throw new NotFoundException();
    }
    return await this.deviceRepository.delete(id);
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

  // 디바이스 여러 개 저장하기
  // 아마도 게이트웨이나 다른 기타사항으로 업데이트 되는거같은디...
  async saveDeviceList(list: DevicesModel[]) {
    const deviceReturn = await Promise.all(
      list.map((device) => this.deviceRepository.save(device)),
    );
    if (deviceReturn.length === 0) {
      throw new BadRequestException(
        '디바이스 리스트를 저장하는데 실패했습니다. 다시 한 번 리스트를 확인해주세요',
      );
    }
    return true;
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

  async updateSensorAndControllerDeviceUseYnList(list: DevicesModel[]) {
    const newList = await this.deviceRepository.save(list);

    if (!newList || newList.length === 0) {
      throw new BadRequestException('잘못된 형식의 리스트를 입력하였습니다.');
    }
  }
}
