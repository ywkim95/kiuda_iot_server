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
import { CreateRealTimeSensorsDto } from './dto/create-real-time-sensor.dto';
import { CreateRealTimeControllersDto } from './dto/create-real-time-contrller.dto';

describe('RealTimeDataService', () => {
  let service: RealTimeDataService;
  let sensorRepository: Repository<SensorRealTimeDataModel>;
  let controllerRepository: Repository<ContRealTimeDataModel>;

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
            create: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(ContRealTimeDataModel),
          useValue: {
            save: jest.fn().mockResolvedValue({}),
            findOne: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(FiveMinutesAverageModel),
          useValue: {
            save: jest.fn().mockResolvedValue({}),
            findOne: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(SensorDeviceModel),
          useValue: {
            save: jest.fn().mockResolvedValue({}),
            findOne: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(ContDeviceModel),
          useValue: {
            save: jest.fn().mockResolvedValue({}),
            findOne: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(ContMapModel),
          useValue: {
            save: jest.fn().mockResolvedValue({}),
            findOne: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(DevicesModel),
          useValue: {
            save: jest.fn().mockResolvedValue({}),
            findOne: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(SensorSpecModel),
          useValue: {
            save: jest.fn().mockResolvedValue({}),
            findOne: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(GatewaysModel),
          useValue: {
            save: jest.fn().mockResolvedValue({}),
            findOne: jest.fn().mockResolvedValue({}),
          },
        },
        // Mock other dependencies like DevicesService, SensorDeviceService, etc.
      ],
    }).compile();

    service = module.get<RealTimeDataService>(RealTimeDataService);
    sensorRepository = module.get<Repository<SensorRealTimeDataModel>>(
      getRepositoryToken(SensorRealTimeDataModel),
    );
    controllerRepository = module.get<Repository<ContRealTimeDataModel>>(
      getRepositoryToken(ContRealTimeDataModel),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('receiveData', () => {
    it('should process and branch data', async () => {
      const dto = { cid: 2 };

      jest.spyOn(sensorRepository, 'save').mockResolvedValueOnce({
        id: 2,
        ...dto,
        rssi: 1,
        sqn: 1,
        device: new DevicesModel(),
        createdAt: new Date(),
      });
      await service.receiveData(dto);

      expect(sensorRepository.save).toHaveBeenCalled();
    });
  });

  // Other tests for methods like branchData, saveSensorData, saveControllerData, fetchRealTimedata, etc. can be added similarly
  describe('branchData', () => {
    it('should save sensor data', async () => {
      const model: SensorRealTimeDataModel = {
        s1: 11,
        s2: 21,
        s3: 31,
        s4: 41,
        s5: 51,
        s6: 61,
        s7: 71,
        s8: 81,
        s9: 91,
        s10: 101,
        s11: 111,
        s12: 121,
        s13: 131,
        s14: 141,
        s15: 151,
        s16: 161,
        s17: 171,
        s18: 181,
        s19: 191,
        s20: 201,
        createdAt: new Date(),
        device: new DevicesModel(),
        id: 3,
        rssi: -100,
        sqn: 20,
      };
      const dto = new CreateRealTimeSensorsDto();
      jest.spyOn(sensorRepository, 'save').mockResolvedValueOnce(model);
      await expect(service['branchData'](dto, true)).resolves.toBeTruthy();
      expect(sensorRepository.save).toHaveBeenCalledWith(dto);
    });

    it('should save controller data', async () => {
      const dto = new CreateRealTimeControllersDto();
      const model: ContRealTimeDataModel = {
        id: 1,
        createdAt: new Date(),
        rssi: -100,
        sqn: 22,
        device: new DevicesModel(),
        gpio1: 'D001',
        gpio2: 'D002',
      };
      jest.spyOn(controllerRepository, 'save').mockResolvedValueOnce(model);
      await expect(service['branchData'](dto, false)).resolves.toBeTruthy();
      expect(controllerRepository.save).toHaveBeenCalledWith(dto);
    });
  });

  describe('saveSensorData', () => {
    it('should create and save sensor data', async () => {
      const model: SensorRealTimeDataModel = {
        s1: 11,
        s2: 21,
        s3: 31,
        s4: 41,
        s5: 51,
        s6: 61,
        s7: 71,
        s8: 81,
        s9: 91,
        s10: 101,
        s11: 111,
        s12: 121,
        s13: 131,
        s14: 141,
        s15: 151,
        s16: 161,
        s17: 171,
        s18: 181,
        s19: 191,
        s20: 201,
        createdAt: new Date(),
        device: new DevicesModel(),
        id: 3,
        rssi: -100,
        sqn: 20,
      };
      const dto = new CreateRealTimeSensorsDto();
      jest.spyOn(sensorRepository, 'save').mockResolvedValueOnce(model);
      await expect(service['saveSensorData'](dto)).resolves.toEqual(dto);
      expect(sensorRepository.save).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('saveControllerData', () => {
    it('should create and save controller data', async () => {
      const dto = new CreateRealTimeControllersDto();
      const model: ContRealTimeDataModel = {
        id: 1,
        createdAt: new Date(),
        rssi: -100,
        sqn: 22,
        device: new DevicesModel(),
        gpio1: 'D001',
        gpio2: 'D002',
      };
      jest.spyOn(controllerRepository, 'save').mockResolvedValueOnce(model);
      await expect(service['saveControllerData'](dto)).resolves.toEqual(model);
      expect(controllerRepository.save).toHaveBeenCalledWith(
        expect.any(Object),
      );
    });
  });

  describe('fetchRealTimedata', () => {
    it('should fetch real-time data', async () => {
      // Mock dependencies and logic
      // Example:
      jest
        .spyOn(sensorRepository, 'findOne')
        .mockResolvedValueOnce(new SensorRealTimeDataModel());
      jest
        .spyOn(controllerRepository, 'findOne')
        .mockResolvedValueOnce(new ContRealTimeDataModel());

      // Assuming a specific input and output for the test
      const roomId = 'someRoomId';
      const expectedOutput = [
        /* expected data objects */
      ];

      await expect(service.fetchRealTimedata(roomId)).resolves.toEqual(
        expectedOutput,
      );
    });
  });
});
