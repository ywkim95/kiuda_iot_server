import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GatewaysService } from '../gateways/gateways.service';
import { DeviceEnum } from '../devices/const/deviceEnum.const';
import { DevicesModel } from '../devices/entities/device.entity';
import { GatewaysModel } from '../gateways/entities/gateway.entity';
import { SettingsService } from './settings.service';

describe('SettingService', () => {
  let service: SettingsService;
  let gatewaysService: GatewaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: GatewaysService,
          useValue: {
            getDevicesFromGatewayId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    gatewaysService = module.get<GatewaysService>(GatewaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSettingValueList', () => {
    it('should throw NotFoundException if no devices found', async () => {
      jest
        .spyOn(gatewaysService, 'getDevicesFromGatewayId')
        .mockResolvedValue([]);
      await expect(service.getSettingValueList(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return a setting object with contMapList, RangeAndCaliList, and useYnList', async () => {
      const mockDevices: DevicesModel[] = [
        {
          id: 1,
          name: 'Device1',
          useYn: true,
          classify: DeviceEnum.CONTROLLER,
          controllers: [],
          sensors: [],
          clientId: '001',
          createdAt: new Date(),
          createdBy: 'user1',
          gateway: new GatewaysModel(),
          pkUpdateDate: new Date(),
          resetYn: false,
          statusCode: 0,
          updatedAt: new Date(),
          updatedBy: 'user2',
        },
        {
          id: 2,
          name: 'Device2',
          useYn: false,
          classify: DeviceEnum.SENSOR,
          controllers: [],
          sensors: [],
          clientId: '002',
          createdAt: new Date(),
          createdBy: 'user2',
          gateway: new GatewaysModel(),
          pkUpdateDate: new Date(),
          resetYn: false,
          statusCode: 1,
          updatedAt: new Date(),
          updatedBy: 'user2',
        },
      ];
      jest
        .spyOn(gatewaysService, 'getDevicesFromGatewayId')
        .mockResolvedValue(mockDevices);

      const result = await service.getSettingValueList(1);
      expect(result).toHaveProperty('contMapList');
      expect(result).toHaveProperty('RangeAndCaliList');
      expect(result).toHaveProperty('useYnList');
      expect(result.useYnList.length).toBe(mockDevices.length);
    });
  });
});
