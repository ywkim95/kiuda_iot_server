import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateDeviceSensorDto } from './dto/update-device-sensor.dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { CreateDeviceSensorDto } from './dto/create-device-sensor.dto';
import { DeviceSensorsPaginationDto } from './dto/paginate-device-sensor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceSensorsModel } from './entities/device-sensor.entity';
import { DevicesService } from 'src/devices/devices.service';
import { SpecificationsService } from '../specifications/specifications-sensor.service';
import { CommonService } from 'src/common/common.service';
import { isEqual } from 'lodash';

@Injectable()
export class DeviceSensorsService {
  constructor(
    @InjectRepository(DeviceSensorsModel)
    private readonly deviceSensorRepository: Repository<DeviceSensorsModel>,
    private readonly deviceService: DevicesService,
    private readonly specService: SpecificationsService,
    private readonly commonService: CommonService,
  ) {}

  // 실기기

  // 페이지네이션
  async paginateDeviceSensors(dto: DeviceSensorsPaginationDto) {
    return await this.commonService.paginate(
      dto,
      this.deviceSensorRepository,
      {
        relations: {
          device: true,
          spec: true,
        },
      },
      'sensors/devices',
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
  async createDeviceSensor(dto: CreateDeviceSensorDto, user: UsersModel) {
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
    dto: UpdateDeviceSensorDto,
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

  async generateDeviceSensors(user: UsersModel) {
    for (let i = 0; i < 12; i++) {
      let dto = new CreateDeviceSensorDto();
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
