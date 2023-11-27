import { Test, TestingModule } from '@nestjs/testing';
import { RealTimeDataController } from './real-time-data.controller';
import { RealTimeDataService } from './real-time-data.service';
import { RealTimeDataSaveService } from './real-time-data-save.service';
import { BadRequestException } from '@nestjs/common';
import { LoRaEnum } from '../real-time-data/const/lora-enum.const';
import { TimeUnitEnum } from './const/time-unit.enum';

describe('RealTimeDataController', () => {
  let controller: RealTimeDataController;
  let realtimeService: RealTimeDataService;
  let saveService: RealTimeDataSaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RealTimeDataController],
      providers: [
        {
          provide: RealTimeDataService,
          useValue: {
            receiveData: jest.fn(),
            getAlarmRangeAndCalibrateById: jest.fn(),
            updateAlarmRangeAndCalibrate: jest.fn(),
            getSensorListByControllerId: jest.fn(),
          },
        },
        {
          provide: RealTimeDataSaveService,
          useValue: {
            getTableAndGraph: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RealTimeDataController>(RealTimeDataController);
    realtimeService = module.get<RealTimeDataService>(RealTimeDataService);
    saveService = module.get<RealTimeDataSaveService>(RealTimeDataSaveService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('postLoRa', () => {
    it('should handle CONTROL case', async () => {
      expect(
        await controller.postLoRa({ lora: 'control' }, LoRaEnum.CONTROL),
      ).toBe('제어');
    });

    // Other cases like JOIN, UPDATE, CUSTOM can be added similarly
  });

  describe('getTableAndGraph', () => {
    it('should throw BadRequestException for invalid dates', async () => {
      await expect(
        controller.getTableAndGraph(
          1,
          TimeUnitEnum.MINUTE,
          'invalid',
          'invalid',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call saveService.getTableAndGraph with correct parameters', async () => {
      const deviceId = 1;
      const timeUnit = TimeUnitEnum.MINUTE;
      const startDate = '2023-01-01T00:00:00Z';
      const endDate = '2023-01-02T00:00:00Z';

      await controller.getTableAndGraph(deviceId, timeUnit, startDate, endDate);

      expect(saveService.getTableAndGraph).toHaveBeenCalledWith(
        deviceId,
        startDate,
        endDate,
        timeUnit,
      );
    });
  });

  // Tests for other methods (getAlarmRangeAndCalibrate, postAlarmRangeAndCalibrate, getSensorMappingList) can be added similarly
});
