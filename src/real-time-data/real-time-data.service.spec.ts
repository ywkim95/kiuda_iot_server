import { Test, TestingModule } from '@nestjs/testing';
import { RealTimeDataService } from './real-time-data.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SensorRealTimeDataModel } from './entities/real-time/real-time-sensor.entity';
import { ContRealTimeDataModel } from './entities/real-time/real-time-controller.entity';
import { DevicesModel } from '../devices/entities/device.entity';
import { FiveMinutesAverageModel } from './entities/average/five-minutes-average.entity';
import { SensorDeviceService } from '../sensors/device/device-sensor.service';
import { ContDeviceService } from '../controllers/device/device-controller.service';
import { ContMapService } from '../controllers/mappings/mappings-controller.service';
import { SensorDeviceModel } from '../sensors/device/entities/device-sensor.entity';
import { DevicesService } from '../devices/devices.service';
import { SensorSpecService } from '../sensors/specifications/specifications-sensor.service';
import { CommonService } from '../common/common.service';
import { ContDeviceModel } from '../controllers/device/entities/devices-controller.entity';
import { ContMapModel } from '../controllers/mappings/entities/mappings-controller.entity';
import { GatewaysService } from '../gateways/gateways.service';
import { SensorSpecModel } from '../sensors/specifications/entities/specifications-sensor.entity';
import { ConfigService } from '@nestjs/config';
import { GatewaysModel } from '../gateways/entities/gateway.entity';

describe('RealTimeDataService', () => {
  let service: RealTimeDataService;
  let sensorRealtimeRepo: Repository<SensorRealTimeDataModel>;
  let contRealtimeRepo: Repository<ContRealTimeDataModel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealTimeDataService,
        SensorDeviceService,
        ContDeviceService,
        ContMapService,
        DevicesService,
        SensorSpecService,
        CommonService,
        GatewaysService,
        ConfigService,
        {
          provide: getRepositoryToken(SensorRealTimeDataModel),
          useValue: {
            save: jest.fn().mockResolvedValue({}),
            findOne: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(ContRealTimeDataModel),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(FiveMinutesAverageModel),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(SensorDeviceModel),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ContDeviceModel),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ContMapModel),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DevicesModel),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(SensorSpecModel),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(GatewaysModel),
          useClass: Repository,
        },
        // Mock other dependencies like DevicesService, SensorDeviceService, etc.
      ],
    }).compile();

    service = module.get<RealTimeDataService>(RealTimeDataService);
    sensorRealtimeRepo = module.get<Repository<SensorRealTimeDataModel>>(
      getRepositoryToken(SensorRealTimeDataModel),
    );
    contRealtimeRepo = module.get<Repository<ContRealTimeDataModel>>(
      getRepositoryToken(ContRealTimeDataModel),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('receiveData', () => {
    it('should process and branch data', async () => {
      const dto = { cid: 2 };

      jest.spyOn(sensorRealtimeRepo, 'save').mockResolvedValueOnce({
        id: 2,
        ...dto,
        rssi: 1,
        sqn: 1,
        device: new DevicesModel(),
        createdAt: new Date(),
      });
      await service.receiveData(dto);

      expect(sensorRealtimeRepo.save).toHaveBeenCalled();
    });
  });

  // Other tests for methods like branchData, saveSensorData, saveControllerData, fetchRealTimedata, etc. can be added similarly
});
