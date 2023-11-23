import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorSpecificationsModel } from './specifications/entities/specifications-sensor.entity';
import { CommonService } from 'src/common/common.service';
import { DeviceSensorsModel } from './device/entities/device-sensor.entity';
import { UsersModel } from 'src/users/entity/users.entity';
import { DeviceSensorsPaginationDto } from './device/dto/paginate-device-sensor.dto';
import { CreateDeviceSensorDto } from './device/dto/create-device-sensor.dto';
import { UpdateDeviceSensorDto } from './device/dto/update-device-sensor.dto';
import { RealTimeSensorsModel } from './real-time/entities/real-time/real-time-sensor.entity';
import { RealTimeControllersModel } from './real-time/entities/real-time/real-time-controller.entity';
import { DevicesService } from '../devices.service';
import { SpecificationsService } from './specifications/specifications-sensor.service';

@Injectable()
export class SensorsService {
  constructor(
    @InjectRepository(SensorSpecificationsModel)
    private readonly SensorSpecificationsRepository: Repository<SensorSpecificationsModel>,
    @InjectRepository(RealTimeSensorsModel)
    private readonly realTimeSensorsRepository: Repository<RealTimeSensorsModel>,
    @InjectRepository(RealTimeControllersModel)
    private readonly realTimeControllersRepository: Repository<RealTimeControllersModel>,
    @InjectRepository(DeviceSensorsModel)
    private readonly deviceSensorRepository: Repository<DeviceSensorsModel>,
    private readonly deviceService: DevicesService,
    private readonly specService: SpecificationsService,
    private readonly commonService: CommonService,
  ) {}

  // -----------------------------------------------------------
  // 관리자

  // 사용자

  async getSensorListFromUser(id: number) {
    const sensorList = await this.deviceSensorRepository.find({
      where: {
        device: {
          id,
        },
      },
    });
  }

  // -----------------------------------------------------------
}
