import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DevicesModel } from './entities/device.entity';
import { Repository } from 'typeorm';
import { DevicePaginationDto } from './dto/paginate-device.dto';
import { CommonService } from '../common/common.service';
import { UsersModel } from '../users/entity/users.entity';
import { GatewaysService } from '../gateways/gateways.service';
import { isEqual } from 'lodash';
import { DeviceEnum } from './const/deviceEnum.const';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DevicesModel)
    private readonly deviceRepository: Repository<DevicesModel>,
    private readonly commonService: CommonService,
    private readonly gatewayService: GatewaysService,
  ) {}

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
    if (!deviceList) {
      throw new NotFoundException();
    }
    return deviceList;
  }
  // ------------------------------------------------------------------

  async getAllDeviceSensorIds() {
    const ids = await this.deviceRepository
      .createQueryBuilder('device')
      .select('device.id')
      .where('device.classify = :classify', { classify: DeviceEnum.SENSOR })
      .getMany();

    return ids.map((device) => device.id);
  }
}
