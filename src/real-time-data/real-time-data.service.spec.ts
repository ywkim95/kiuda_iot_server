import { Test, TestingModule } from '@nestjs/testing';
import { RealTimeDataService } from './real-time-data.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SensorRealTimeDataModel } from './entities/real-time/real-time-sensor.entity';
import { ContRealTimeDataModel } from './entities/real-time/real-time-controller.entity';
import { AccumulatedIrradianceModel } from './entities/accumulate/accumulated-irradiance.entity';
import { DevicesService } from '../devices/devices.service';
import { SensorDeviceService } from '../sensors/device/device-sensor.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DeviceEnum } from '../devices/const/deviceEnum.const';
import { GatewaysModel } from '../gateways/entities/gateway.entity';
import { DevicesModel } from '../devices/entities/device.entity';
import { RolesEnum } from '../users/const/roles.const';
import { PermissionsEnum } from '../users/const/permission.const';
import { formatStringAsThreeDigit } from '../gateways/const/format-string-as-three-digit.const';
const dummyUsers = {
  email: 'user_94@example.com',
  password: 'Password123!',
  name: 'User_64',
  address: 'Address_16',
  phoneNumber: '010-6855-4980',
  lastLoginDate: new Date(),
  lastLoginIp: '192.168.199.203',
  roles: RolesEnum.USER,
  permission: PermissionsEnum.PREMIUM,
  createdAt: new Date(),
  id: 23,
  logs: [],
  updatedAt: new Date(),
  gateways: [],
};
const dummyGateways = {
  owner: dummyUsers,
  countryId: 'Country_63',
  areaId: 'Area_87',
  gatewayId: 'Gateway_81',
  location: 'Location_50',
  name: 'GatewayName_62',
  description: 'Description for Gateway',
  frequency: 5,
  txPower: 6,
  rfConfig: 4,
  gatewayIdInc: 1,
  controlScript: 'Control Script Example',
  ssid: 'SSID_34',
  ssidPassword: 'Password123',
  resetYn: true,
  lastPkUpdateDate: new Date(),
  useYn: true,
  devices: [],
  createdAt: new Date(),
  id: 49,
  updatedAt: new Date(),
  formatFields() {
    this.countryId = formatStringAsThreeDigit(this.countryId);
    this.areaId = formatStringAsThreeDigit(this.areaId);
    this.gatewayId = formatStringAsThreeDigit(this.gatewayId);
  },
};

const dummyDevices: DevicesModel = {
  clientId: '001',
  classify: DeviceEnum.SENSOR,
  controllers: [],
  createdAt: new Date(),
  gateway: new GatewaysModel(),
  id: 1,
  name: 'device',
  resetYn: true,
  sensors: [],
  statusCode: 0,
  updatedAt: new Date(),
  useYn: false,
};

const dummyDevices2 = {
  controllers: [],
  createdAt: new Date(),
  id: 35,
  sensors: [],
  updatedAt: new Date(),
  name: 'Device_81',
  clientId: 'ClientID_66',
  description: 'Description for device',
  location: 'Location_4',
  classify: DeviceEnum.SENSOR,
  resetYn: false,
  pkUpdateDate: new Date(),
  useYn: false,
  statusCode: 96,
  gateway: dummyGateways,
};

const dummyRealTimeData: SensorRealTimeDataModel = {
  id: 206,
  createdAt: new Date(),
  device: dummyDevices2,
  rssi: -13,
  sqn: 61,
  s1: 39.59,
  s2: 88.55,
  s3: 46.1,
  s4: 38.06,
  s5: 37.57,
  s6: 69.98,
  s7: 16.69,
  s8: 16.6,
  s9: 56.74,
  s10: 71.48,
  s11: 69.19,
  s12: 42.62,
  s13: 35.06,
  s14: 8.83,
  s15: 10.7,
  s16: 88.26,
  s17: 31.96,
  s18: 68.66,
  s19: 24.99,
  s20: 25.23,
};

const sensorDataDto = {
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
  rssi: -100,
  sqn: 20,
  ghid: '123',
  glid: '456',
  gid: '789',
  cid: '012',
};

describe('RealTimeDataService', () => {
  let service: RealTimeDataService;
  let sensorRealTimeDataRepository: Repository<SensorRealTimeDataModel>;
  let contRealTimeDataRepository: Repository<ContRealTimeDataModel>;
  let accumulatedIrradianceRepository: Repository<AccumulatedIrradianceModel>;
  let devicesService: DevicesService;
  let sensorDeviceService: SensorDeviceService;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealTimeDataService,
        {
          provide: getRepositoryToken(SensorRealTimeDataModel),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ContRealTimeDataModel),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(AccumulatedIrradianceModel),
          useClass: Repository,
        },
        {
          provide: DevicesService,
          useValue: {
            getOnceDeviceByIdList: jest.fn().mockResolvedValue(dummyDevices),
          },
        },
        {
          provide: SensorDeviceService,
          useValue: {
            // 모의 메서드 구현
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            // 모의 메서드 구현
          },
        },
      ],
    }).compile();

    service = module.get<RealTimeDataService>(RealTimeDataService);
    sensorRealTimeDataRepository = module.get(
      getRepositoryToken(SensorRealTimeDataModel),
    );
    contRealTimeDataRepository = module.get(
      getRepositoryToken(ContRealTimeDataModel),
    );
    accumulatedIrradianceRepository = module.get(
      getRepositoryToken(AccumulatedIrradianceModel),
    );
    devicesService = module.get<DevicesService>(DevicesService);
    sensorDeviceService = module.get<SensorDeviceService>(SensorDeviceService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  // 추가 테스트 케이스들...
  it('should save sensor data correctly', async () => {
    //{ghid: '123', glid: '456', gid: '789', cid: '012'}
    jest
      .spyOn(devicesService, 'getOnceDeviceByIdList')
      .mockResolvedValue(dummyDevices);
    jest
      .spyOn(sensorRealTimeDataRepository, 'create')
      .mockReturnValue(dummyRealTimeData);
    jest
      .spyOn(sensorRealTimeDataRepository, 'save')
      .mockResolvedValue(dummyRealTimeData);

    const result = await service.receiveData(sensorDataDto);

    expect(devicesService.getOnceDeviceByIdList).toHaveBeenCalled();
    expect(sensorRealTimeDataRepository.create).toHaveBeenCalledWith(
      sensorDataDto,
    );
    expect(sensorRealTimeDataRepository.save).toHaveBeenCalledWith(
      sensorDataDto,
    );
    expect(result).toEqual({
      ghid: '123',
      glid: '456',
      gid: '789',
      cid: '012',
    });
  });

  // it('should validate and notify for sensor devices', async () => {
  //   const sensorDeviceList = [
  //     /* 적절한 센서 장치 리스트 */
  //   ];
  //   const dto = {
  //     /* 적절한 DTO 데이터 */
  //   };
  //   const user = {
  //     /* 적절한 사용자 데이터 */
  //   };

  //   jest
  //     .spyOn(notificationsService, 'registerNotification')
  //     .mockResolvedValue(undefined);

  //   await service.validateAndNotify(sensorDeviceList, dto, user);

  //   expect(notificationsService.registerNotification).toHaveBeenCalled();
  // });

  // it('should save accumulated irradiance data', async () => {
  //   const onceIrradiance = 10;
  //   const deviceId = 1;

  //   jest
  //     .spyOn(accumulatedIrradianceRepository, 'findOne')
  //     .mockResolvedValue(undefined);
  //   jest
  //     .spyOn(accumulatedIrradianceRepository, 'create')
  //     .mockReturnValue(/* 적절한 반환 값 */);
  //   jest
  //     .spyOn(accumulatedIrradianceRepository, 'save')
  //     .mockResolvedValue(undefined);

  //   await service.saveAccumulateData(onceIrradiance, deviceId);

  //   expect(
  //     accumulatedIrradianceRepository.findOne,
  //   ).toHaveBeenCalledWith(/* 예상되는 인자 */);
  //   expect(
  //     accumulatedIrradianceRepository.create,
  //   ).toHaveBeenCalledWith(/* 예상되는 인자 */);
  //   expect(
  //     accumulatedIrradianceRepository.save,
  //   ).toHaveBeenCalledWith(/* 예상되는 인자 */);
  // });

  // it('should save sensor data correctly', async () => {
  //   const dto = {
  //     /* 적절한 DTO 데이터 */
  //   };
  //   jest
  //     .spyOn(devicesService, 'getOnceDeviceByIdList')
  //     .mockResolvedValue(/* 적절한 반환 값 */);
  //   jest
  //     .spyOn(sensorRealTimeDataRepository, 'create')
  //     .mockReturnValue(/* 적절한 반환 값 */);
  //   jest
  //     .spyOn(sensorRealTimeDataRepository, 'save')
  //     .mockResolvedValue(undefined);

  //   const result = await service.saveSensorData(dto);

  //   expect(devicesService.getOnceDeviceByIdList).toHaveBeenCalled();
  //   expect(
  //     sensorRealTimeDataRepository.create,
  //   ).toHaveBeenCalledWith(/* 예상되는 인자 */);
  //   expect(
  //     sensorRealTimeDataRepository.save,
  //   ).toHaveBeenCalledWith(/* 예상되는 인자 */);
  //   expect(result).toEqual(/* 예상되는 반환 값 */);
  // });
});
